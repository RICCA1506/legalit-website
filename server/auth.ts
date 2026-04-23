import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { generateSecret as otpGenerateSecret, generateURI, verify as otpVerify } from "otplib";
import QRCode from "qrcode";
import { storage, hashToken } from "./storage";
import { loginSchema, registerSchema, twoFactorSetupSchema, twoFactorVerifySchema, passwordSchema } from "@shared/schema";
import { sendPasswordResetEmail, sendLoginCodeEmail } from "./email";

const BCRYPT_ROUNDS = 12;

// Rate limiting for auth endpoints - 5 attempts per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per window
  message: { message: "Troppi tentativi. Riprova tra 15 minuti." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lighter rate limiting for token verification - 20 attempts per 15 minutes
const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Troppi tentativi. Riprova tra 15 minuti." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Session inactivity timeout (30 minutes)
const SESSION_INACTIVITY_TIMEOUT = 30 * 60 * 1000;

declare module "express-session" {
  interface SessionData {
    userId?: string;
    lastActivity?: number;
    csrfToken?: string;
    pending2FA?: boolean;
    pending2FAUserId?: string;
  }
}

export function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set. The server cannot start without a valid session secret.");
  }
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
    errorLog: (err: Error) => {
      console.error("[SessionStore] Error:", err.message);
    },
  });
  const isProduction = process.env.NODE_ENV === "production";
  const isReplit = !!process.env.REPLIT_DOMAINS;
  const useSecure = isProduction || isReplit;
  const useSameSite = useSecure ? "none" : "lax";
  console.log(`[Session] Configuring session: production=${isProduction}, replit=${isReplit}, proxy=true, secure=${useSecure}, sameSite=${useSameSite}, path=/`);
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: "legalit.sid",
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: useSecure,
      maxAge: sessionTtl,
      sameSite: useSameSite,
      path: "/",
      domain: undefined,
    },
  });
}

// Generate CSRF token
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Session activity tracking middleware - check for inactivity timeout
  app.use((req, res, next) => {
    if (req.session.userId && req.session.lastActivity) {
      const now = Date.now();
      if (now - req.session.lastActivity > SESSION_INACTIVITY_TIMEOUT) {
        // Session expired due to inactivity
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
        });
        return res.status(401).json({ message: "Sessione scaduta per inattività. Effettua nuovamente l'accesso." });
      }
    }
    // Update last activity
    if (req.session.userId) {
      req.session.lastActivity = Date.now();
    }
    next();
  });

  // CSRF validation middleware for all state-changing requests on authenticated sessions
  const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
  app.use((req, res, next) => {
    if (CSRF_SAFE_METHODS.has(req.method)) return next();
    if (!req.session.userId) return next();
    const token = req.headers["x-csrf-token"] as string | undefined;
    if (!token || token !== req.session.csrfToken) {
      return res.status(403).json({ message: "Richiesta non valida: token CSRF mancante o non corretto" });
    }
    next();
  });

  // CSRF token endpoint - get a token for forms
  app.get("/api/auth/csrf-token", (req, res) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    res.json({ csrfToken: req.session.csrfToken });
  });

  // Health check endpoint for session store
  app.get("/api/auth/health", async (_req, res) => {
    try {
      const user = await storage.getUserByEmail("admin@legalit.it");
      res.json({ 
        status: "ok", 
        dbConnected: !!user,
        env: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Login endpoint with rate limiting and 2FA support
  app.post("/api/auth/login", authRateLimiter, async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const ua = req.headers["user-agent"] || "unknown";
    const proto = req.protocol;
    const xfp = req.headers["x-forwarded-proto"];
    console.log(`[Auth] Login attempt from IP=${ip}, proto=${proto}, x-forwarded-proto=${xfp}, secure=${req.secure}`);
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log(`[Auth] Login validation failed:`, parsed.error.errors);
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }

      const { email, password, twoFactorCode } = parsed.data;
      console.log(`[Auth] Login attempt for email=${email}`);
      const user = await storage.getUserByEmail(email);

      if (!user || !user.hashedPassword) {
        console.log(`[Auth] Login failed: user not found for ${email}`);
        await storage.createAuditLog({ eventType: "login_failed", targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "User not found" });
        return res.status(401).json({ message: "Email o password non corretti" });
      }

      const validPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!validPassword) {
        console.log(`[Auth] Login failed: invalid password for ${email}`);
        await storage.createAuditLog({ eventType: "login_failed", actorId: user.id, actorEmail: user.email, targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "Invalid password" });
        const failedCount = await storage.getRecentFailedAttempts(email, 60);
        if (failedCount >= 10) {
          console.warn(`[SECURITY ALERT] >10 failed login attempts for ${email} in last hour from IP ${ip}`);
        }
        return res.status(401).json({ message: "Email o password non corretti" });
      }

      if (user.twoFactorEnabled === "true" && user.twoFactorSecret) {
        if (!twoFactorCode) {
          req.session.pending2FA = true;
          req.session.pending2FAUserId = user.id;
          return res.json({ 
            requires2FA: true, 
            message: "Inserisci il codice di autenticazione a due fattori" 
          });
        }

        const result = await otpVerify({ token: twoFactorCode, secret: user.twoFactorSecret });
        if (!result.valid) {
          await storage.createAuditLog({ eventType: "login_failed", actorId: user.id, actorEmail: user.email, targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "Invalid 2FA code" });
          return res.status(401).json({ message: "Codice di autenticazione non valido" });
        }
      }

      req.session.pending2FA = false;
      req.session.pending2FAUserId = undefined;
      req.session.userId = user.id;
      req.session.lastActivity = Date.now();
      // Initialize CSRF token for the new session
      if (!req.session.csrfToken) {
        req.session.csrfToken = generateCsrfToken();
      }
      
      await storage.createAuditLog({ eventType: "login_success", actorId: user.id, actorEmail: user.email, targetEmail: email, ipAddress: ip, userAgent: ua, success: "true" });
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[Auth] Session save error after login:", saveErr);
          return res.status(500).json({ message: "Errore durante il salvataggio della sessione" });
        }
        const setCookieHeader = res.getHeaders()["set-cookie"];
        console.log(`[Auth] Login successful for ${email}, sid=${req.sessionID}, set-cookie=${setCookieHeader ? 'present' : 'MISSING'}`);
        res.json({ message: "Accesso effettuato", user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled === "true"
        }});
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ message: "Errore durante l'accesso" });
    }
  });

  // Register endpoint (invite-only) with rate limiting
  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const ua = req.headers["user-agent"] || "unknown";
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }

      const { email, password, firstName, lastName, token } = parsed.data;

      const tokenHashed = hashToken(token);
      const invite = await storage.getInviteByTokenHash(tokenHashed);
      if (!invite) {
        await storage.createAuditLog({ eventType: "registration_failed", targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "Invalid or expired token" });
        return res.status(400).json({ message: "Token di invito non valido o scaduto" });
      }

      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        await storage.createAuditLog({ eventType: "registration_failed", targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "Email mismatch" });
        return res.status(400).json({ message: "L'email non corrisponde all'invito" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        await storage.createAuditLog({ eventType: "registration_failed", targetEmail: email, ipAddress: ip, userAgent: ua, success: "false", details: "User already exists" });
        return res.status(400).json({ message: "Utente già registrato" });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await storage.createUser({
        email: email.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
        role: "partner",
      });

      await storage.markInviteUsed(invite.id);

      req.session.userId = user.id;
      req.session.lastActivity = Date.now();
      
      await storage.createAuditLog({ eventType: "registration_success", actorId: user.id, actorEmail: user.email, targetEmail: email, ipAddress: ip, userAgent: ua, success: "true" });
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error after registration:", saveErr);
          return res.status(500).json({ message: "Errore durante il salvataggio della sessione" });
        }
        console.log(`[Auth] Registration successful for ${email}, session saved, sid=${req.sessionID}`);
        res.status(201).json({ message: "Registrazione completata", user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }});
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  // Verify invite token (for registration page) with rate limiting
  app.get("/api/auth/verify-invite/:token", verifyRateLimiter, async (req, res) => {
    try {
      const tokenHashed = hashToken(req.params.token);
      const invite = await storage.getInviteByTokenHash(tokenHashed);
      if (!invite) {
        return res.status(404).json({ message: "Token non valido o scaduto" });
      }
      res.json({ email: invite.email });
    } catch (error) {
      console.error("Verify invite error:", error);
      res.status(500).json({ message: "Errore durante la verifica" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      res.clearCookie("legalit.sid");
      res.clearCookie("connect.sid");
      res.json({ message: "Logout effettuato" });
    });
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const cookieHeader = req.headers.cookie;
      const hasSidCookie = cookieHeader ? (cookieHeader.includes("legalit.sid") || cookieHeader.includes("connect.sid")) : false;
      
      if (!req.session.userId) {
        console.log(`[Auth] GET /api/auth/user - UNAUTHORIZED: sid=${req.sessionID}, cookie=${hasSidCookie ? 'has-sid' : (cookieHeader ? 'no-sid' : 'no-cookie')}, sessionKeys=${Object.keys(req.session).join(',')}`);
        return res.status(401).json({ message: "Non autenticato" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        console.log(`[Auth] GET /api/auth/user - user not found in DB for userId=${req.session.userId}`);
        return res.status(401).json({ message: "Utente non trovato" });
      }

      console.log(`[Auth] GET /api/auth/user - OK: ${user.email}, role=${user.role}`);
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        twoFactorEnabled: user.twoFactorEnabled === "true",
      });
    } catch (error) {
      console.error("[Auth] Get user error:", error);
      res.status(500).json({ message: "Errore durante il recupero utente" });
    }
  });

  // 2FA Setup - Generate secret and QR code
  app.post("/api/auth/2fa/setup", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Utente non trovato" });
      }

      // Generate secret
      const secret = otpGenerateSecret();
      const otpAuthUrl = generateURI({ issuer: "LEGALIT", label: user.email, secret });
      
      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

      res.json({ 
        secret, 
        qrCodeUrl,
        message: "Scansiona il QR code con la tua app di autenticazione"
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Errore durante la configurazione 2FA" });
    }
  });

  // 2FA Enable - Verify code and enable 2FA
  app.post("/api/auth/2fa/enable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const parsed = twoFactorSetupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }

      const { secret, code } = parsed.data;

      // Verify the code
      const verifyResult = await otpVerify({ token: code, secret });
      if (!verifyResult.valid) {
        return res.status(400).json({ message: "Codice non valido. Riprova." });
      }

      // Save secret and enable 2FA
      await storage.updateUser(req.session.userId, {
        twoFactorSecret: secret,
        twoFactorEnabled: "true"
      });

      res.json({ message: "Autenticazione a due fattori attivata con successo" });
    } catch (error) {
      console.error("2FA enable error:", error);
      res.status(500).json({ message: "Errore durante l'attivazione 2FA" });
    }
  });

  // 2FA Disable - Turn off 2FA
  app.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const parsed = twoFactorVerifySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA non attivo" });
      }

      // Verify the code before disabling
      const disableResult = await otpVerify({ token: parsed.data.code, secret: user.twoFactorSecret });
      if (!disableResult.valid) {
        return res.status(400).json({ message: "Codice non valido" });
      }

      // Disable 2FA
      await storage.updateUser(req.session.userId, {
        twoFactorSecret: null,
        twoFactorEnabled: "false"
      });

      res.json({ message: "Autenticazione a due fattori disattivata" });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Errore durante la disattivazione 2FA" });
    }
  });

  // Password reset - Request reset email
  app.post("/api/auth/forgot-password", authRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email richiesta" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "Se l'email esiste nel sistema, riceverai un link per reimpostare la password." });
      }

      // Generate token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHashed = hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(email.toLowerCase(), tokenHashed, expiresAt);

      // Build reset URL using a trusted base URL from environment, never from request headers
      const appBaseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "") || "https://legalit.it";
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email.toLowerCase(), resetUrl);

      res.json({ message: "Se l'email esiste nel sistema, riceverai un link per reimpostare la password." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Errore durante la richiesta di reset" });
    }
  });

  // Password reset - Verify token
  app.get("/api/auth/verify-reset/:token", verifyRateLimiter, async (req, res) => {
    try {
      const tokenHashed = hashToken(req.params.token);
      const resetToken = await storage.getPasswordResetByTokenHash(tokenHashed);
      if (!resetToken) {
        return res.status(404).json({ message: "Token non valido o scaduto" });
      }
      res.json({ email: resetToken.email });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ message: "Errore durante la verifica" });
    }
  });

  // Password reset - Set new password
  app.post("/api/auth/reset-password", authRateLimiter, async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token e password richiesti" });
      }

      // Validate password strength using the same policy as registration
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        return res.status(400).json({ message: passwordValidation.error.errors[0].message });
      }

      const tokenHashed = hashToken(token);
      const resetToken = await storage.getPasswordResetByTokenHash(tokenHashed);
      if (!resetToken) {
        return res.status(400).json({ message: "Token non valido o scaduto" });
      }

      const user = await storage.getUserByEmail(resetToken.email);
      if (!user) {
        return res.status(400).json({ message: "Utente non trovato" });
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await storage.updateUser(user.id, { hashedPassword });
      await storage.markPasswordResetUsed(resetToken.id);

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const ua = req.headers["user-agent"] || "unknown";
      await storage.createAuditLog({
        eventType: "password_reset",
        actorId: user.id,
        actorEmail: user.email,
        targetEmail: user.email,
        ipAddress: ip,
        userAgent: ua,
        success: "true",
        details: "Password reset via email link",
      });

      res.json({ message: "Password reimpostata con successo. Puoi ora accedere con la nuova password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Errore durante il reset della password" });
    }
  });

  // Email login code - Request code
  app.post("/api/auth/request-login-code", authRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email richiesta" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());

      // Always return generic response to prevent email enumeration
      // Only admin and superadmin users can receive a login code
      const genericResponse = { message: "Se l'email esiste nel sistema, riceverai un codice di accesso." };
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.json(genericResponse);
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = hashToken(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createEmailLoginCode(email.toLowerCase(), codeHash, expiresAt);
      await sendLoginCodeEmail(email.toLowerCase(), code);

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const ua = req.headers["user-agent"] || "unknown";
      await storage.createAuditLog({
        eventType: "login_code_requested",
        targetEmail: email.toLowerCase(),
        ipAddress: ip,
        userAgent: ua,
        success: "true",
      });

      res.json({ message: "Se l'email esiste nel sistema, riceverai un codice di accesso." });
    } catch (error) {
      console.error("Request login code error:", error);
      res.status(500).json({ message: "Errore durante l'invio del codice" });
    }
  });

  // Email login code - Verify code and login
  app.post("/api/auth/verify-login-code", authRateLimiter, async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const ua = req.headers["user-agent"] || "unknown";
    try {
      const { email, code } = req.body;
      if (!email || !code || typeof email !== "string" || typeof code !== "string") {
        return res.status(400).json({ message: "Email e codice richiesti" });
      }

      const codeHash = hashToken(code);
      const loginCode = await storage.getEmailLoginCodeByHash(codeHash, email.toLowerCase());

      if (!loginCode) {
        await storage.createAuditLog({
          eventType: "login_code_failed",
          targetEmail: email.toLowerCase(),
          ipAddress: ip,
          userAgent: ua,
          success: "false",
          details: "Invalid or expired code",
        });
        return res.status(401).json({ message: "Codice non valido o scaduto" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: "Utente non trovato" });
      }

      await storage.markEmailLoginCodeUsed(loginCode.id);

      req.session.userId = user.id;
      req.session.lastActivity = Date.now();

      await storage.createAuditLog({
        eventType: "login_code_success",
        actorId: user.id,
        actorEmail: user.email,
        targetEmail: email.toLowerCase(),
        ipAddress: ip,
        userAgent: ua,
        success: "true",
      });

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error after login code:", saveErr);
          return res.status(500).json({ message: "Errore durante il salvataggio della sessione" });
        }
        console.log(`[Auth] Login code successful for ${email}, session saved, sid=${req.sessionID}`);
        res.json({
          message: "Accesso effettuato",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled === "true",
          },
        });
      });
    } catch (error) {
      console.error("Verify login code error:", error);
      res.status(500).json({ message: "Errore durante la verifica del codice" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non autenticato" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Utente non trovato" });
  }

  (req as any).user = user;
  next();
};

export const requireAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non autenticato" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Utente non trovato" });
  }
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({ message: "Non autorizzato" });
  }
  (req as any).user = user;
  next();
};

// requireSuperAdmin — restricts an endpoint to the one superadmin account only.
// Destructive actions (role changes, user deletion, data sync) use this middleware.
// Regular admin tasks (content management, invites) use requireAdmin instead.
export const requireSuperAdmin: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Non autenticato" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Utente non trovato" });
  }
  if (user.role !== 'superadmin') {
    return res.status(403).json({ message: "Non autorizzato" });
  }
  (req as any).user = user;
  next();
};

// Admin-only endpoints setup
export async function setupAdminRoutes(app: Express) {
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return users without sensitive fields (password hash and 2FA secret)
      const safeUsers = users.map(({ hashedPassword, twoFactorSecret, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Errore durante il recupero degli utenti" });
    }
  });

  // Delete user (superadmin only)
  app.delete("/api/admin/users/:userId", requireSuperAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const requestingUser = req.user;

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Cannot delete superadmin
      if (targetUser.role === 'superadmin') {
        return res.status(403).json({ message: "Non puoi eliminare un superadmin" });
      }

      await storage.deleteUser(userId);
      console.log(`User deleted: ${targetUser.email} was deleted by ${requestingUser.email}`);

      res.json({ message: "Utente eliminato con successo" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Errore durante l'eliminazione dell'utente" });
    }
  });

  // Update user role (superadmin only)
  // "superadmin" is intentionally excluded from validRoles — it can only be
  // assigned via server/seed.ts and a redeployment. There is no API path that
  // allows any user, including a superadmin, to grant the superadmin role.
  app.post("/api/admin/update-role", requireSuperAdmin, async (req: any, res) => {
    try {
      const { userId, newRole } = req.body;
      const requestingUser = req.user;
      
      if (!userId || !newRole) {
        return res.status(400).json({ message: "UserId e nuovo ruolo richiesti" });
      }

      // Only "partner" and "admin" are reachable from the UI. "superadmin" is reserved.
      const validRoles = ['partner', 'admin'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({ message: "Ruolo non valido" });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Superadmin role is immutable via the API — changes must go through seed.ts.
      if (targetUser.role === 'superadmin') {
        return res.status(403).json({ message: "Non puoi modificare il ruolo di un superadmin" });
      }

      await storage.updateUser(userId, { role: newRole });
      console.log(`Role update: User ${targetUser.email} role changed to ${newRole} by ${requestingUser.email}`);

      res.json({ message: "Ruolo aggiornato con successo" });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Errore durante l'aggiornamento del ruolo" });
    }
  });

  // Reset user password (admin only)
  app.post("/api/admin/reset-password", requireAdmin, async (req: any, res) => {
    try {
      const { userId, newPassword } = req.body;
      const requestingUser = req.user;

      if (!userId || !newPassword) {
        return res.status(400).json({ message: "UserId e nuova password richiesti" });
      }

      const passwordValidation = passwordSchema.safeParse(newPassword);
      if (!passwordValidation.success) {
        return res.status(400).json({ message: passwordValidation.error.errors[0].message });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Admins cannot reset passwords for superadmins or other admins — only superadmins can do that
      if (targetUser.role === 'superadmin') {
        return res.status(403).json({ message: "Non puoi resettare la password di un superadmin" });
      }
      if (targetUser.role === 'admin' && requestingUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Solo un superadmin può resettare la password di un admin" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await storage.updateUser(userId, { hashedPassword });

      // Log password reset for audit trail
      console.log(`Password reset: User ${targetUser.email} password was reset by ${requestingUser.email}`);

      res.json({ message: "Password resettata con successo" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Errore durante il reset della password" });
    }
  });
}

// Generate a random invite token
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
