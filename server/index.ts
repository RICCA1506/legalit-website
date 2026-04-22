import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { seedAdminUser } from "./seed";
import { ensureSchema } from "./migrate";
import { createServer } from "http";
import path from "path";
import fs from "fs";

declare module "express-session" {
  interface SessionData {
    siteAccessGranted?: boolean;
  }
}

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (isProduction) {
    const host = req.hostname;
    const xfp = req.headers["x-forwarded-proto"];
    const proto = typeof xfp === "string" ? xfp.split(",")[0].trim() : undefined;

    if (host.startsWith("www.")) {
      const canonical = host.replace(/^www\./, "");
      return res.redirect(301, `https://${canonical}${req.originalUrl}`);
    }

    if (proto === "http") {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }

  if (req.path !== "/" && req.path.endsWith("/")) {
    const wpGoneRe = /^\/(wp-admin|wp-content|wp-includes|feed|comments\/feed)(\/|$)/i;
    if (!wpGoneRe.test(req.path)) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, req.path.slice(0, -1) + query);
    }
  }

  next();
});

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https://www.google-analytics.com", "https://api.mymemory.translated.net", "https://www.linkedin.com", "https://*.linkedin.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com", "https://*.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: false,
  frameguard: { action: "sameorigin" },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }
  next();
});

const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");
if (fs.existsSync(attachedAssetsPath)) {
  app.use("/attached_assets", express.static(attachedAssetsPath, {
    maxAge: isProduction ? "7d" : 0,
    setHeaders: (res, filePath) => {
      if (isProduction && /\.(avif|webp|jpg|jpeg|png|gif|svg)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      }
    },
  }));
  console.log(`[Static] Serving attached_assets from: ${attachedAssetsPath}`);
} else {
  console.warn(`[Static] attached_assets directory not found at: ${attachedAssetsPath}`);
}
const httpServer = createServer(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await ensureSchema();
  } catch (err) {
    console.error("Server startup aborted: schema migration failed", err);
    process.exit(1);
  }
  await seedAdminUser();
  await registerRoutes(httpServer, app);

  const sitePassword = undefined; // Site is fully public
  if (sitePassword) {
    const gateHtmlPath = path.resolve(process.cwd(), "server/site-gate.html");
    const gateHtml = fs.readFileSync(gateHtmlPath, "utf-8");

    const isReplit = !!process.env.REPLIT_DOMAINS;
    const gateMaxAge = 24 * 60 * 60;
    const gateCookieOptions = [
      "site-access=granted",
      "HttpOnly",
      "Path=/",
      `Max-Age=${gateMaxAge}`,
      isReplit || isProduction ? "Secure" : "",
      isReplit || isProduction ? "SameSite=None" : "SameSite=Lax",
    ].filter(Boolean).join("; ");

    function hasSiteAccess(req: Request): boolean {
      const cookie = req.headers.cookie || "";
      return cookie.split(";").some(c => c.trim() === "site-access=granted");
    }

    app.post("/api/site-access", (req: Request, res: Response) => {
      const { password } = req.body || {};
      if (password === sitePassword) {
        res.setHeader("Set-Cookie", gateCookieOptions);
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Password non corretta" });
      }
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (
        req.path === "/api/site-access" ||
        req.path.startsWith("/api/auth/") ||
        hasSiteAccess(req)
      ) {
        return next();
      }
      res.status(200).type("html").send(gateHtml);
    });

    log("Site password gate enabled");
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("[Error Handler]", status, message, err.stack || "");
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
