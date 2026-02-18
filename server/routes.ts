import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import { storage, hashToken } from "./storage";
import { setupAuth, setupAdminRoutes, isAuthenticated, generateInviteToken } from "./auth";
import { insertNewsArticleSchema, insertProfessionalSchema, insertNewsCategorySchema, insertNewsletterSubscriberSchema, insertContactMessageSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { sendContactEmail, sendJobApplicationEmail } from "./email";
import { getLinkedInFollowers, updateLinkedInFollowers, startFollowerSync } from "./linkedin";
import { syncDevDataToCurrentDb } from "./syncData";
import { GoogleGenerativeAI } from "@google/generative-ai";

const practiceAreaKeywords: Record<string, string[]> = {
  "diritto-lavoro": ["diritto del lavoro", "giuslavoristic", "lavoratore", "lavoratori", "lavoratrice", "licenziamento", "licenziamenti", "previdenziale", "sindacale", "sindacato", "contratto collettivo", "ccnl", "relazioni industriali", "retribuzione", "tfr", "inps", "inail", "cassa integrazione", "mobbing", "demansionamento", "jobs act", "smart working", "lavoro agile", "welfare aziendale", "sicurezza sul lavoro", "rapporto di lavoro", "datore di lavoro"],
  "diritto-penale": ["diritto penale", "procedimento penale", "processo penale", "codice penale", "cassazione penale", "tribunale penale", "reato", "reati", "imputato", "imputazione", "condanna", "assoluzione", "pubblico ministero", "custodia cautelare", "reclusione", "querela", "delitto"],
  "diritto-civile-commerciale": ["diritto civile", "codice civile", "diritto commerciale", "responsabilità civile", "risarcimento danni", "inadempimento", "risoluzione contrattuale", "compravendita", "usucapione", "servitù"],
  "corporate-compliance": ["compliance", "d.lgs. 231", "responsabilità degli enti", "modello organizzativo", "modello 231", "modelli 231", "organismo di vigilanza", "odv", "internal investigation", "whistleblowing", "anticorruzione", "antiriciclaggio"],
  "diritto-societario-ma": ["diritto societario", "fusione", "acquisizione", "m&a", "merger", "patti parasociali", "scissione", "joint venture", "corporate governance", "assemblea dei soci", "consiglio di amministrazione"],
  "banking-finance": ["diritto bancario", "banking", "fintech", "cartolarizzazione", "mercati finanziari", "consob", "banca d'italia", "usura", "anatocismo", "fideiussione bancaria"],
  "diritto-assicurazioni": ["diritto assicurativo", "assicurazione", "assicurazioni", "polizza", "sinistro", "sinistri", "indennizzo", "ivass", "compagnia assicurativa", "riassicurazione"],
  "crisi-impresa": ["crisi d'impresa", "crisi di impresa", "fallimento", "fallimentare", "concordato", "concordato preventivo", "sovraindebitamento", "procedura concorsuale", "codice della crisi", "composizione negoziata", "ccii", "ristrutturazione del debito"],
  "recupero-crediti": ["recupero crediti", "npl", "non performing", "pignoramento", "decreto ingiuntivo", "espropriazione forzata", "procedura esecutiva", "creditore", "debitore"],
  "diritto-amministrativo": ["diritto amministrativo", "pubblica amministrazione", "ente pubblico", "enti pubblici", "ente locale", "enti locali", "tar", "consiglio di stato", "appalto pubblico", "appalti pubblici", "conferenza di servizi"],
  "responsabilita-contabile": ["responsabilità contabile", "corte dei conti", "danno erariale", "giudizio di conto"],
  "ambiente-energia": ["diritto ambientale", "diritto dell'ambiente", "reati ambientali", "inquinamento ambientale", "energia rinnovabile", "fotovoltaico", "eolico", "emissioni", "bonifica", "valutazione impatto ambientale", "transizione ecologica", "ecoreati", "criminalità ambientale"],
  "affari-regolatori": ["affari regolatori", "public affairs", "lobby", "lobbying", "agcm", "antitrust", "arera", "agcom"],
  "diritto-sport": ["diritto sportivo", "diritto dello sport", "atleta", "calciatore", "figc", "coni", "doping", "tesseramento", "agente sportivo", "giustizia sportiva", "collegio di garanzia"],
  "diritto-tributario": ["diritto tributario", "contenzioso tributario", "agenzia delle entrate", "accertamento fiscale", "evasione fiscale", "elusione fiscale", "irpef", "ires", "irap", "credito d'imposta", "dichiarazione dei redditi", "corte di giustizia tributaria"],
  "diritto-sanitario": ["diritto sanitario", "responsabilità medica", "malasanità", "malpractice", "dispositivi medici", "life sciences", "clinical trial", "sperimentazione clinica", "consenso informato"],
  "privacy-cybersecurity": ["privacy", "gdpr", "dati personali", "trattamento dati", "garante privacy", "data protection", "intelligenza artificiale", "cybersecurity", "sicurezza informatica", "data breach", "violazione dati", "profilazione"],
  "real-estate": ["diritto immobiliare", "real estate", "urbanistica", "permesso di costruire", "piano regolatore", "catasto", "condominio"],
  "tutela-patrimoni": ["diritto di famiglia", "divorzio", "separazione", "affidamento", "successione", "successioni", "eredità", "testamento", "trust", "fondo patrimoniale", "patto di famiglia", "amministrazione di sostegno"],
};

function detectPracticeAreaTags(title: string, content: string, excerpt: string | null | undefined, linkedPracticeArea: string | null | undefined): string[] {
  const text = `${title} ${content} ${excerpt || ""}`.toLowerCase();
  const detected: string[] = [];
  for (const [areaId, keywords] of Object.entries(practiceAreaKeywords)) {
    if (areaId === linkedPracticeArea) continue;
    let matchCount = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    if (matchCount >= 2) {
      detected.push(areaId);
    }
  }
  return detected;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Admin routes (user management, password reset)
  await setupAdminRoutes(app);

  startFollowerSync();

  app.get("/api/linkedin-followers", async (_req, res) => {
    try {
      const count = await getLinkedInFollowers();
      res.json({ followers: count });
    } catch (error) {
      res.json({ followers: "788" });
    }
  });

  app.patch("/api/linkedin-followers", isAuthenticated, async (req: any, res) => {
    try {
      const { followers } = req.body;
      if (!followers || typeof followers !== "string") {
        return res.status(400).json({ message: "Invalid follower count" });
      }
      await updateLinkedInFollowers(followers);
      res.json({ followers });
    } catch (error) {
      res.status(500).json({ message: "Failed to update follower count" });
    }
  });

  // Public news routes
  app.get("/api/news", async (_req, res) => {
    try {
      const articles = await storage.getAllNewsArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getNewsArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Protected news routes (only authenticated users can create/edit/delete)
  app.post("/api/news", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertNewsArticleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid article data", errors: parsed.error.errors });
      }
      
      const user = req.user;
      
      const autoTags = detectPracticeAreaTags(
        parsed.data.title,
        parsed.data.content,
        parsed.data.excerpt,
        parsed.data.linkedPracticeArea
      );
      
      const article = await storage.createNewsArticle({
        ...parsed.data,
        tags: autoTags,
        authorId: user.id,
        authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      });
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/news/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body against partial schema
      const parsed = insertNewsArticleSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid article data", errors: parsed.error.errors });
      }
      
      // Remove immutable fields (authorId, authorName) from update
      const { authorId, authorName, ...updateData } = parsed.data;
      
      if (updateData.title || updateData.content || updateData.excerpt || updateData.linkedPracticeArea) {
        const existing = await storage.getNewsArticle(id);
        if (existing) {
          const title = updateData.title || existing.title;
          const content = updateData.content || existing.content;
          const excerpt = updateData.excerpt !== undefined ? updateData.excerpt : existing.excerpt;
          const linkedArea = updateData.linkedPracticeArea !== undefined ? updateData.linkedPracticeArea : existing.linkedPracticeArea;
          const autoTags = detectPracticeAreaTags(title, content, excerpt, linkedArea);
          updateData.tags = autoTags;
        }
      }
      
      const article = await storage.updateNewsArticle(id, updateData);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.post("/api/news/auto-tag", isAuthenticated, async (req: any, res) => {
    try {
      const articles = await storage.getAllNewsArticles();
      let updated = 0;
      for (const article of articles) {
        const autoTags = detectPracticeAreaTags(article.title, article.content, article.excerpt, article.linkedPracticeArea);
        const currentTags = article.tags || [];
        const tagsChanged = JSON.stringify(autoTags.sort()) !== JSON.stringify([...currentTags].sort());
        if (tagsChanged) {
          await storage.updateNewsArticle(article.id, { tags: autoTags });
          updated++;
        }
      }
      res.json({ message: `Auto-tagged ${updated} articles`, total: articles.length });
    } catch (error) {
      console.error("Error auto-tagging:", error);
      res.status(500).json({ message: "Failed to auto-tag articles" });
    }
  });

  app.post("/api/news/auto-fit-images", isAuthenticated, async (req: any, res) => {
    try {
      const articles = await storage.getAllNewsArticles();
      let updated = 0;
      for (const article of articles) {
        if (article.imageUrl && (article.imagePosition !== "50,50" || article.imageZoom !== 100)) {
          await storage.updateNewsArticle(article.id, { imagePosition: "50,50", imageZoom: 100 });
          updated++;
        }
      }
      res.json({ message: `Reset ${updated} images`, total: articles.length });
    } catch (error) {
      console.error("Error resetting images:", error);
      res.status(500).json({ message: "Failed to reset images" });
    }
  });

  app.delete("/api/news/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNewsArticle(id);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json({ message: "Article deleted" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Partner invite routes (only authenticated users can manage invites)
  app.get("/api/invites", isAuthenticated, async (_req, res) => {
    try {
      const invites = await storage.getAllInvites();
      res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  app.post("/api/invites", isAuthenticated, async (req: any, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email richiesta" });
      }

      const existingInvite = await storage.getInviteByEmail(email.toLowerCase());
      if (existingInvite && !existingInvite.usedAt) {
        return res.status(400).json({ message: "Questo indirizzo email è già stato invitato" });
      }

      const existingUser = await storage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ message: "Questo utente è già registrato" });
      }

      const plaintextToken = generateInviteToken();
      const tokenHashed = hashToken(plaintextToken);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const invite = await storage.createInvite({
        email: email.toLowerCase(),
        tokenHash: tokenHashed,
        expiresAt,
        createdBy: req.user.id,
      });

      const ip = req.ip || req.socket.remoteAddress || "unknown";
      const ua = req.headers["user-agent"] || "unknown";
      await storage.createAuditLog({
        eventType: "invite_created",
        actorId: req.user.id,
        actorEmail: req.user.email,
        targetEmail: email.toLowerCase(),
        ipAddress: ip,
        userAgent: ua,
        success: "true",
      });

      res.status(201).json({ 
        ...invite,
        inviteUrl: `/registrazione?token=${plaintextToken}` 
      });
    } catch (error) {
      console.error("Error creating invite:", error);
      res.status(500).json({ message: "Failed to create invite" });
    }
  });

  app.delete("/api/invites/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvite(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invite not found" });
      }
      res.json({ message: "Invite deleted" });
    } catch (error) {
      console.error("Error deleting invite:", error);
      res.status(500).json({ message: "Failed to delete invite" });
    }
  });

  // Public professionals routes
  app.get("/api/professionals", async (_req, res) => {
    try {
      const allProfessionals = await storage.getAllProfessionals();
      res.json(allProfessionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  // Protected professionals routes (only authenticated users can create/edit/delete)
  app.post("/api/professionals", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertProfessionalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid professional data", errors: parsed.error.errors });
      }
      
      const professional = await storage.createProfessional(parsed.data);
      res.status(201).json(professional);
    } catch (error) {
      console.error("Error creating professional:", error);
      res.status(500).json({ message: "Failed to create professional" });
    }
  });

  app.patch("/api/professionals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate request body against partial schema
      const parsed = insertProfessionalSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid professional data", errors: parsed.error.errors });
      }
      
      const professional = await storage.updateProfessional(id, parsed.data);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Error updating professional:", error);
      res.status(500).json({ message: "Failed to update professional" });
    }
  });

  app.delete("/api/professionals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProfessional(id);
      if (!deleted) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json({ message: "Professional deleted" });
    } catch (error) {
      console.error("Error deleting professional:", error);
      res.status(500).json({ message: "Failed to delete professional" });
    }
  });

  // Seed professionals from existing data
  app.post("/api/professionals/seed", isAuthenticated, async (_req: any, res) => {
    try {
      const existingProfessionals = await storage.getAllProfessionals();
      if (existingProfessionals.length > 0) {
        return res.status(400).json({ message: "Database già popolato con professionisti", count: existingProfessionals.length });
      }

      const seedData = [
        { name: "Avv. Fabiana Liberati", title: "Partner", specializations: ["labor"], office: "Roma", email: "f.liberati@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto del lavoro pubblico e privato, relazioni industriali, sicurezza sul lavoro, diritto della navigazione con particolare riferimento al trasporto aereo.", fullBio: "Fabiana Liberati si occupa prevalentemente di diritto del lavoro pubblico e privato, relazioni industriali, sicurezza sul lavoro, diritto della navigazione con particolare riferimento al trasposto aereo.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma La Sapienza", "Master di specializzazione in Diritto Sindacale e Relazioni Industriali (2014)"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Fabiana-Liberati.jpg", orderIndex: 1 },
        { name: "Avv. Luigi Passalacqua", title: "Partner Fondatore", specializations: ["labor"], office: "Roma", email: "l.passalacqua@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto del lavoro, sindacale e della previdenza sociale.", fullBio: "Luigi Passalacqua si occupa prevalentemente di diritto del lavoro, sindacale e della previdenza sociale.", education: ["Laurea in Giurisprudenza - Università di Roma Tre", "Master di secondo livello in discipline del lavoro - Università Tor Vergata"], languages: ["Italiano", "Inglese", "Spagnolo"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Luigi-Passalacqua.jpg", orderIndex: 2 },
        { name: "Avv. Francesco Vaccaro", title: "Partner Fondatore", specializations: ["criminal"], office: "Roma", email: "f.vaccaro@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto penale dei 'colletti bianchi', di compliance, diritto commerciale, fallimentare, bancario, sanitario e sportivo.", fullBio: "Francesco Vaccaro si occupa prevalentemente di diritto penale dei 'colletti bianchi'.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma Tre", "Master in diritto penale d'impresa - LUISS Guido Carli"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Francesco-Vaccaro-1.jpg", orderIndex: 3 },
        { name: "Prof. Avv. Pasquale Passalacqua", title: "Partner", specializations: ["labor"], office: "Roma", email: "p.passalacqua@legalit.it", phone: "06 3213911", bio: "Professore Ordinario di Diritto del lavoro presso l'Università di Roma Tor Vergata. Avvocato Cassazionista dal 2011.", fullBio: "Pasquale Passalacqua è professore Ordinario di Diritto del lavoro.", education: ["Laurea cum laude in Giurisprudenza - Università di Roma Tor Vergata", "Dottorato di ricerca in Diritto Sindacale e del Lavoro"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Pasquale-Passalacqua.jpg", orderIndex: 4 },
        { name: "Avv. Alessandro Santomauro", title: "Partner", specializations: ["civil"], office: "Roma", email: "a.santomauro@legalit.it", phone: "06 3213911", bio: "Specializzato nel settore del private M&A, del diritto societario e del diritto commerciale.", fullBio: "Alessandro Santomauro è specializzato nel settore del private M&A.", education: ["Laurea in Giurisprudenza - Università Roma Tre (2000)", "Master of Laws (LL.M.) - University of Pennsylvania (2006)"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Alessandro-Santomauro.jpg", orderIndex: 5 },
        { name: "Avv. Renato Piero Biasci", title: "Partner", specializations: ["civil"], office: "Roma", email: "r.biasci@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto civile, commerciale, fallimentare, famiglia, immobiliare e recupero crediti.", fullBio: "Renato Piero Biasci si occupa prevalentemente di diritto civile.", education: ["Laurea in Giurisprudenza - Università degli Studi La Sapienza (1983)"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Renato-Piero-Basci-1.jpg", orderIndex: 6 },
        { name: "Avv. Sonja Puglionisi", title: "Partner", specializations: ["civil", "labor"], office: "Roma", email: "s.puglionisi@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto civile, con significativa esperienza nel diritto del lavoro.", fullBio: "Sonja Puglionisi si occupa prevalentemente di diritto civile.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma Tre (2004)"], languages: ["Italiano", "Inglese"], imageUrl: null, orderIndex: 7 },
        { name: "Avv. Francesco Pastorello", title: "Associato", specializations: ["criminal"], office: "Roma", email: "f.pastorello@legalit.it", phone: "06 3213911", bio: "Si occupa principalmente di diritto penale e di diritto sanitario, compliance.", fullBio: "Francesco Pastorello si occupa principalmente di diritto penale e di diritto sanitario.", education: ["Laurea in Giurisprudenza - Università La Sapienza"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Francesco-Pastorello-1.jpg", orderIndex: 8 },
        { name: "Avv. Bernardo Fabbri", title: "Associato", specializations: ["civil", "criminal"], office: "Roma", email: "b.fabbri@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di compliance privacy, responsabilità degli enti ex D.Lgs. 231/01.", fullBio: "Bernardo Fabbri si occupa prevalentemente di compliance privacy.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma La Sapienza"], languages: ["Italiano", "Inglese", "Francese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Bernardo-Fabbri.jpg", orderIndex: 9 },
        { name: "Avv. Andrea Silvestri", title: "Associato", specializations: ["civil"], office: "Roma", email: "a.silvestri@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto societario e bancario, con esperienza nel gaming.", fullBio: "Andrea Silvestri si occupa prevalentemente di diritto societario.", education: ["Laurea in Giurisprudenza - Università di Roma Tre"], languages: ["Italiano", "Inglese", "Spagnolo"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/02/silvestri-6_edit-scaled.jpg", orderIndex: 10 },
        { name: "Avv. Claudio Iafrate", title: "Associato", specializations: ["civil"], office: "Roma", email: "c.iafrate@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto civile, societario e assicurativo.", fullBio: "Claudio Iafrate si occupa prevalentemente del settore del diritto civile.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma Tre (2013)"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Claudio-Iafrate.jpg", orderIndex: 11 },
        { name: "Avv. Lorenzo Ferrara", title: "Associato", specializations: ["criminal"], office: "Roma", email: "l.ferrara@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto penale, diritto penale di impresa e compliance.", fullBio: "Lorenzo Ferrara si occupa prevalentemente di diritto penale.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma Tre"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Lorenzo-Ferrara.jpg", orderIndex: 12 },
        { name: "Avv. Laura Stefanelli", title: "Associato", specializations: ["civil", "labor"], office: "Roma", email: "l.stefanelli@legalit.it", phone: "06 3213911", bio: "Si occupa prevalentemente di diritto civile, famiglia, lavoro e tributario.", fullBio: "Laura Stefanelli si occupa prevalentemente di diritto civile.", education: ["Laurea in Giurisprudenza - Università degli Studi di Roma La Sapienza (2008)"], languages: ["Italiano", "Inglese"], imageUrl: null, orderIndex: 13 },
        { name: "Avv. Carmelina Adamo", title: "Partner", specializations: ["criminal"], office: "Milano", email: "c.adamo@legalit.it", phone: "02 83424497", bio: "Si occupa prevalentemente di diritto penale, famiglia, immigrazione e recupero credito.", fullBio: "Carmelina Adamo si occupa prevalentemente di diritto penale.", education: ["Laurea in Giurisprudenza - Università degli Studi di Milano"], languages: ["Italiano", "Inglese", "Francese"], imageUrl: null, orderIndex: 14 },
        { name: "Avv. Tommaso Giannini", title: "Partner", specializations: ["labor"], office: "Milano", email: "t.giannini@legalit.it", phone: "02 83424497", bio: "Si occupa prevalentemente di diritto del lavoro.", fullBio: "Tommaso Giannini si occupa prevalentemente di diritto del lavoro.", education: ["Laurea in Giurisprudenza - Università degli Studi di Milano"], languages: ["Italiano", "Inglese"], imageUrl: "https://www.legalit.it/wp-content/uploads/2021/10/Avv.-Tommaso-Giannini.jpg", orderIndex: 15 },
        { name: "Avv. Antonio Ferrante", title: "Partner", specializations: ["civil"], office: "Palermo", email: "a.ferrante@legalit.it", phone: "091 7781494", bio: "Si occupa prevalentemente di diritto civile e commerciale.", fullBio: "Antonio Ferrante si occupa prevalentemente di diritto civile.", education: ["Laurea in Giurisprudenza - Università degli Studi di Palermo"], languages: ["Italiano", "Inglese"], imageUrl: null, orderIndex: 16 },
      ];

      let count = 0;
      for (const prof of seedData) {
        await storage.createProfessional(prof);
        count++;
      }

      res.status(201).json({ message: "Professionisti caricati con successo", count });
    } catch (error) {
      console.error("Error seeding professionals:", error);
      res.status(500).json({ message: "Failed to seed professionals" });
    }
  });

  // News categories routes (public GET, protected POST/PATCH/DELETE)
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const categories = await storage.getCategoriesByType(type);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by type:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertNewsCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parsed.error.errors });
      }
      const category = await storage.createCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertNewsCategorySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid category data", errors: parsed.error.errors });
      }
      const category = await storage.updateCategory(id, parsed.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Seed default categories
  app.post("/api/categories/seed", isAuthenticated, async (_req: any, res) => {
    try {
      const existingCategories = await storage.getAllCategories();
      if (existingCategories.length > 0) {
        return res.status(400).json({ message: "Categorie già presenti nel database", count: existingCategories.length });
      }

      const defaultCategories = [
        // Macro categories (branches)
        { name: "Diritto Civile", nameEn: "Civil Law", type: "macro", parentCategory: null, isDefault: "true" },
        { name: "Diritto Penale", nameEn: "Criminal Law", type: "macro", parentCategory: null, isDefault: "true" },
        { name: "Diritto Amministrativo", nameEn: "Administrative Law", type: "macro", parentCategory: null, isDefault: "true" },
        { name: "Diritto Tributario", nameEn: "Tax Law", type: "macro", parentCategory: null, isDefault: "true" },
        { name: "Diritto Commerciale", nameEn: "Business Law", type: "macro", parentCategory: null, isDefault: "true" },
        // Micro categories
        { name: "Diritto del Lavoro", nameEn: "Labor Law", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Diritto Tributario e Doganale", nameEn: "Tax & Customs Law", type: "micro", parentCategory: "tax", isDefault: "true" },
        { name: "Diritto Internazionale", nameEn: "International Law", type: "micro", parentCategory: null, isDefault: "true" },
        { name: "Diritto dell'Unione Europea", nameEn: "EU Law", type: "micro", parentCategory: null, isDefault: "true" },
        { name: "Trasporti", nameEn: "Transport", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Concorrenza", nameEn: "Competition", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Successioni", nameEn: "Succession", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Immobiliare", nameEn: "Real Estate", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Contratti", nameEn: "Contracts", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Responsabilità Civile", nameEn: "Civil Liability", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Diritto Agrario", nameEn: "Agricultural Law", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Diritto Commerciale", nameEn: "Commercial Law", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Proprietà Intellettuale", nameEn: "Intellectual Property", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Fallimentare", nameEn: "Insolvency", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Esecuzioni", nameEn: "Enforcement", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Bancario e Finanziario", nameEn: "Banking & Finance", type: "micro", parentCategory: "business", isDefault: "true" },
        { name: "Consumatori", nameEn: "Consumer Law", type: "micro", parentCategory: "civil", isDefault: "true" },
        { name: "Reati contro la Persona", nameEn: "Crimes against Person", type: "micro", parentCategory: "criminal", isDefault: "true" },
        { name: "Reati contro la PA", nameEn: "Crimes against PA", type: "micro", parentCategory: "criminal", isDefault: "true" },
        { name: "Ambiente", nameEn: "Environment", type: "micro", parentCategory: "administrative", isDefault: "true" },
        { name: "Diritto Penale d'Impresa", nameEn: "Corporate Criminal Law", type: "micro", parentCategory: "criminal", isDefault: "true" },
        { name: "Criminalità Organizzata", nameEn: "Organized Crime", type: "micro", parentCategory: "criminal", isDefault: "true" },
        { name: "Esecuzione Penale", nameEn: "Criminal Execution", type: "micro", parentCategory: "criminal", isDefault: "true" },
        { name: "Tech & Digitale", nameEn: "Tech & Digital", type: "micro", parentCategory: null, isDefault: "true" },
      ];

      let count = 0;
      for (const cat of defaultCategories) {
        await storage.createCategory(cat);
        count++;
      }

      res.status(201).json({ message: "Categorie caricate con successo", count });
    } catch (error) {
      console.error("Error seeding categories:", error);
      res.status(500).json({ message: "Failed to seed categories" });
    }
  });

  // Newsletter subscriber routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const parsed = insertNewsletterSubscriberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Email non valida", errors: parsed.error.errors });
      }

      const existingSubscriber = await storage.getSubscriberByEmail(parsed.data.email);
      if (existingSubscriber) {
        if (existingSubscriber.unsubscribedAt) {
          // Re-subscribe
          await storage.createSubscriber({ email: parsed.data.email, source: parsed.data.source || "website" });
          return res.status(201).json({ message: "Iscrizione riattivata con successo" });
        }
        return res.status(400).json({ message: "Email già iscritta alla newsletter" });
      }

      await storage.createSubscriber(parsed.data);
      res.status(201).json({ message: "Iscrizione completata con successo" });
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Email già iscritta alla newsletter" });
      }
      res.status(500).json({ message: "Errore durante l'iscrizione" });
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email richiesta" });
      }
      const unsubscribed = await storage.unsubscribe(email);
      if (!unsubscribed) {
        return res.status(404).json({ message: "Email non trovata" });
      }
      res.json({ message: "Disiscrizione completata" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Errore durante la disiscrizione" });
    }
  });

  app.get("/api/newsletter/subscribers", isAuthenticated, async (_req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Image upload routes
  app.post("/api/upload", isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
      
      const urlParts = new URL(uploadUrl);
      const pathParts = urlParts.pathname.split('/');
      const objectId = pathParts[pathParts.length - 1];
      const objectPath = `/objects/uploads/${objectId}`;
      
      res.json({ uploadUrl, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Serve uploaded objects
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ message: "Object not found" });
      }
      res.status(500).json({ message: "Failed to serve object" });
    }
  });

  // Contact form routes - PUBLIC (anyone can submit contact form)
  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }
      
      // Determine target email based on subject
      // - "informazioni-amministrative" -> amministrazione@legalit.it
      // - "collaborazione" -> recruitment@legalit.it
      // - All other subjects -> info@legalit.it
      const subject = parsed.data.subject;
      let targetEmail = "info@legalit.it";
      if (subject === "informazioni-amministrative") {
        targetEmail = "amministrazione@legalit.it";
      } else if (subject === "collaborazione") {
        targetEmail = "recruitment@legalit.it";
      }
      
      const message = await storage.createContactMessage({
        ...parsed.data,
        targetEmail,
      });
      
      sendContactEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
        targetEmail,
      }).catch(err => console.error("[Email] Background send failed:", err));
      
      res.status(201).json({ message: "Messaggio inviato con successo", id: message.id });
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Errore nell'invio del messaggio" });
    }
  });

  // Protected contact message routes (only authenticated users can view/manage)
  app.get("/api/contact", isAuthenticated, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.patch("/api/contact/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markContactMessageRead(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  app.delete("/api/contact/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContactMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted" });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Admin statistics endpoint
  app.get("/api/admin/stats", isAuthenticated, async (_req, res) => {
    try {
      const [articles, professionals, categories, subscribers, users] = await Promise.all([
        storage.getAllNewsArticles(),
        storage.getAllProfessionals(),
        storage.getAllCategories(),
        storage.getAllSubscribers(),
        storage.getAllUsers(),
      ]);

      const studioNews = articles.filter(a => a.newsType === "studio" || !a.newsType);
      const legalNews = articles.filter(a => a.newsType === "legal_world");
      const publishedArticles = articles;
      const draftArticles: typeof articles = [];
      const activeSubscribers = subscribers.filter(s => !s.unsubscribedAt);
      const macroCategories = categories.filter(c => c.type === "macro");
      const microCategories = categories.filter(c => c.type === "micro");

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const articlesLastMonth = articles.filter(a => a.createdAt && new Date(a.createdAt) > lastMonth);
      const subscribersLastMonth = subscribers.filter(s => s.subscribedAt && new Date(s.subscribedAt) > lastMonth);

      res.json({
        totals: {
          articles: articles.length,
          professionals: professionals.length,
          categories: categories.length,
          subscribers: activeSubscribers.length,
          users: users.length,
        },
        articles: {
          studio: studioNews.length,
          legal: legalNews.length,
          published: publishedArticles.length,
          draft: draftArticles.length,
          lastMonth: articlesLastMonth.length,
        },
        categories: {
          macro: macroCategories.length,
          micro: microCategories.length,
        },
        newsletter: {
          active: activeSubscribers.length,
          total: subscribers.length,
          lastMonth: subscribersLastMonth.length,
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  // Job applications route - PUBLIC (anyone can submit)
  // Schema for job applications - extends base contact message with position field
  const jobApplicationSchema = z.object({
    name: z.string().min(1, "Nome richiesto"),
    email: z.string().email("Email non valida"),
    phone: z.string().optional().nullable(),
    message: z.string().min(1, "Messaggio richiesto"),
    position: z.string().optional(),
  });
  
  app.post("/api/job-applications", async (req, res) => {
    try {
      const parsed = jobApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dati non validi", errors: parsed.error.errors });
      }
      
      const { name, email, phone, message, position } = parsed.data;
      
      // Store job application as a contact message with special subject
      // All job applications go to recruitment@legalit.it
      const positionName = position || 'Autocandidatura';
      const application = await storage.createContactMessage({
        name,
        email,
        phone: phone || null,
        subject: `Candidatura: ${positionName}`,
        message,
        targetEmail: "recruitment@legalit.it",
      });
      
      sendJobApplicationEmail({
        name,
        email,
        phone,
        message,
        position: positionName,
      }).catch(err => console.error("[Email] Background job app send failed:", err));
      
      res.status(201).json({ message: "Candidatura inviata con successo", id: application.id });
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Errore nell'invio della candidatura" });
    }
  });

  app.post("/api/scrape-linkedin", isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL mancante" });
      }
      try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.endsWith("linkedin.com")) {
          return res.status(400).json({ message: "URL non valido. Inserisci un link LinkedIn." });
        }
      } catch {
        return res.status(400).json({ message: "URL non valido. Inserisci un link LinkedIn." });
      }

      const urlsToTry = [url];
      const activityMatch = url.match(/activity[:-](\d+)/);
      if (activityMatch) {
        const activityId = activityMatch[1];
        urlsToTry.push(`https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`);
        urlsToTry.push(`https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}`);
      }
      if (url.includes("/pulse/")) {
        urlsToTry.push(url);
      }

      const userAgents = [
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ];

      let html = "";
      let fetched = false;

      const uniqueUrls = Array.from(new Set(urlsToTry));
      for (const tryUrl of uniqueUrls) {
        if (fetched) break;
        for (const ua of userAgents) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(tryUrl, {
              headers: {
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
                "Cache-Control": "no-cache",
              },
              redirect: "follow",
              signal: controller.signal,
            });
            clearTimeout(timeout);
            if (response.ok) {
              const text = await response.text();
              if (text.includes("og:title") || text.includes("og:description") || text.includes("data-id")) {
                html = text;
                fetched = true;
                break;
              }
              if (!html && text.length > 1000) {
                html = text;
              }
            }
          } catch {}
        }
      }

      if (!html) {
        return res.status(400).json({ message: "Impossibile accedere al contenuto LinkedIn. Il link potrebbe essere privato o non valido. Puoi compilare i campi manualmente." });
      }

      console.log(`[LinkedIn Scrape] Fetched ${html.length} chars, has OG tags: ${fetched}`);

      const getMetaContent = (property: string): string => {
        const patterns = [
          new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
          new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
        ];
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match) return match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        }
        return "";
      };

      const title = getMetaContent("og:title") || getMetaContent("twitter:title") || "";
      const description = getMetaContent("og:description") || getMetaContent("twitter:description") || getMetaContent("description") || "";
      const image = getMetaContent("og:image") || getMetaContent("twitter:image") || "";

      let content = description;
      const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          const articleBody = jsonLd.articleBody || jsonLd.text || jsonLd.description;
          if (articleBody && articleBody.length > content.length) {
            content = articleBody;
          }
        } catch {}
      }

      if (!title && !description && !content) {
        const embedTextMatch = html.match(/<div[^>]*class="[^"]*feed-shared-text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (embedTextMatch) {
          content = embedTextMatch[1].replace(/<[^>]+>/g, '').trim();
        }
      }

      const cleanTitle = title
        .replace(/\s*\|\s*LinkedIn\s*$/i, "")
        .replace(/^.*?:\s*/, "")
        .trim();

      const wordCount = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`;

      res.json({
        title: cleanTitle || "Post LinkedIn",
        content: content,
        excerpt: content.length > 200 ? content.substring(0, 200) + "..." : content,
        imageUrl: image,
        linkedinUrl: url,
        readTime,
      });
    } catch (error: any) {
      console.error("[LinkedIn Scrape] Error:", error);
      res.status(500).json({ message: "Errore nel recupero del contenuto LinkedIn" });
    }
  });

  // ========== AUTO TRANSLATION ==========

  app.get("/api/translations", async (_req, res) => {
    try {
      const allTranslations = await storage.getAllTranslations();
      const map: Record<string, string> = {};
      for (const t of allTranslations) {
        map[t.key] = t.value;
      }
      res.json(map);
    } catch (error) {
      console.error("[Translations] Error:", error);
      res.json({});
    }
  });

  app.post("/api/auto-translate", async (req, res) => {
    try {
      const { texts, sourceLang = "it", targetLang = "en" } = req.body;
      if (!texts || !Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({ message: "texts array required" });
      }

      const uniqueTexts = Array.from(new Set(texts.filter((t: string) => t && t.trim().length > 0))) as string[];
      if (uniqueTexts.length > 100) {
        return res.status(400).json({ message: "Max 100 texts per request" });
      }

      const results: Record<string, string> = {};
      const toTranslate: string[] = [];

      const cached = await storage.getTranslationsByKeys(uniqueTexts, targetLang);
      for (const text of uniqueTexts) {
        if (cached[text]) {
          results[text] = cached[text];
        } else {
          toTranslate.push(text);
        }
      }

      const translateChunk = async (chunk: string, src: string, tgt: string): Promise<string> => {
        try {
          const encoded = encodeURIComponent(chunk);
          const apiUrl = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${src}|${tgt}&de=noreply@legalit.it`;
          const response = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
          if (response.ok) {
            const data = await response.json() as any;
            if (data.responseStatus === 200 && data.responseData?.translatedText) {
              let translated = data.responseData.translatedText;
              if (translated.toUpperCase() === translated && chunk.toUpperCase() !== chunk) {
                return chunk;
              }
              return translated;
            }
          }
          return chunk;
        } catch {
          return chunk;
        }
      };

      const splitIntoChunks = (text: string, maxLen: number): string[] => {
        if (text.length <= maxLen) return [text];
        const chunks: string[] = [];
        const sentences = text.split(/(?<=[.!?;])\s+/);
        let current = "";
        for (const sentence of sentences) {
          if (sentence.length > maxLen) {
            if (current.trim()) { chunks.push(current.trim()); current = ""; }
            const words = sentence.split(/\s+/);
            let wordChunk = "";
            for (const word of words) {
              if ((wordChunk + " " + word).trim().length > maxLen) {
                if (wordChunk.trim()) chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                wordChunk = wordChunk ? wordChunk + " " + word : word;
              }
            }
            if (wordChunk.trim()) { current = wordChunk; }
            continue;
          }
          if ((current + " " + sentence).trim().length > maxLen) {
            if (current.trim()) chunks.push(current.trim());
            current = sentence;
          } else {
            current = current ? current + " " + sentence : sentence;
          }
        }
        if (current.trim()) chunks.push(current.trim());
        return chunks.length > 0 ? chunks : [text.substring(0, maxLen)];
      };

      if (toTranslate.length > 0) {
        const batchSize = 3;
        for (let i = 0; i < toTranslate.length; i += batchSize) {
          const batch = toTranslate.slice(i, i + batchSize);
          const translationPromises = batch.map(async (text) => {
            const chunks = splitIntoChunks(text, 480);
            const translatedChunks: string[] = [];
            for (const chunk of chunks) {
              const result = await translateChunk(chunk, sourceLang, targetLang);
              translatedChunks.push(result);
              if (chunks.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }
            const translated = translatedChunks.join(" ");
            return { text, translated };
          });

          const batchResults = await Promise.all(translationPromises);
          for (const { text, translated } of batchResults) {
            results[text] = translated;
            if (translated !== text) {
              await storage.upsertTranslation(text, targetLang, translated);
            }
          }
        }
      }

      res.json(results);
    } catch (error) {
      console.error("[AutoTranslate] Error:", error);
      res.status(500).json({ message: "Translation error" });
    }
  });

  app.put("/api/translations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { value } = req.body;
      const id = parseInt(req.params.id);
      if (!value || isNaN(id)) return res.status(400).json({ message: "Invalid request" });
      await storage.updateTranslation(id, value);
      res.json({ success: true });
    } catch (error) {
      console.error("[Translations] Update error:", error);
      res.status(500).json({ message: "Error updating translation" });
    }
  });

  app.delete("/api/translations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteTranslation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("[Translations] Delete error:", error);
      res.status(500).json({ message: "Error deleting translation" });
    }
  });

  app.get("/api/translations/all", isAuthenticated, async (_req, res) => {
    try {
      const allTranslations = await storage.getAllTranslationsDetailed();
      res.json(allTranslations);
    } catch (error) {
      console.error("[Translations] Error:", error);
      res.json([]);
    }
  });

  app.post("/api/admin/sync-data", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user?.role !== "superadmin") {
        return res.status(403).json({ message: "Solo superadmin può sincronizzare i dati" });
      }
      const result = await syncDevDataToCurrentDb();
      res.json({ message: "Sincronizzazione completata", ...result });
    } catch (error: any) {
      console.error("[Sync] Endpoint error:", error);
      res.status(500).json({ message: "Errore durante la sincronizzazione", error: error.message });
    }
  });

  app.get("/news", async (req, res, next) => {
    const articleId = req.query.article;
    if (!articleId) return next();

    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isCrawler = /linkedinbot|facebookexternalhit|twitterbot|whatsapp|telegram|slackbot|discordbot|googlebot/i.test(ua);
    if (!isCrawler) return next();

    try {
      const article = await storage.getNewsArticle(Number(articleId));
      if (!article) return next();

      const proto = req.headers["x-forwarded-proto"] || req.protocol;
      const siteUrl = `${proto}://${req.get("host")}`;
      const articleUrl = `${siteUrl}/news?article=${article.id}`;
      const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const title = escHtml(article.title);
      const description = escHtml((article.excerpt || article.content.slice(0, 200)));
      const image = article.imageUrl ? (article.imageUrl.startsWith("http") ? article.imageUrl : `${siteUrl}${article.imageUrl}`) : `${siteUrl}/favicon.png`;

      res.send(`<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${articleUrl}" />
<meta property="og:site_name" content="LEGALIT - Società tra Avvocati" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<title>${title} - LEGALIT</title>
<meta name="description" content="${description}" />
<meta http-equiv="refresh" content="0;url=${articleUrl}" />
</head>
<body><p>Redirecting to <a href="${articleUrl}">${title}</a></p></body>
</html>`);
    } catch {
      next();
    }
  });

  // Gemini AI Chatbot route
  const systemInstruction = `
### ROLE ###
Senior AI Legal Concierge per "LEGALIT". Sei un consulente d'alto livello: discreto, analitico e mai ripetitivo. Il tuo compito è trasformare un dubbio legale in una pratica indirizzata al partner corretto.

### CONVERSATIONAL STYLE (Natural & Human) ###
- **No Cliché:** Non iniziare con "Capisco", "Certamente" o "In base a quanto detto".
- **Domande Contestuali:** Se l'utente parla di un problema, non chiedere "Sei azienda o privato?". Chiedi invece: "Questa situazione riguarda la sua attività professionale o la sua sfera personale?" oppure "Parliamo di un dipendente della sua società o della sua posizione lavorativa?"
- **Discrezione:** Non fare un interrogatorio. Commenta brevemente il fatto per mostrare competenza e poi fai la domanda successiva.

### UI COMMANDS (Trigger per Frontend) ###
Usa questi tag nel testo per attivare le funzioni visive:
1. **[SHOW_LOG]**: Inseriscilo all'inizio di ogni risposta complessa per aggiornare il "Filo del Discorso" (il ragionamento del bot).
2. **[SHOW_CARD: CONFIRM_TRIAGE]**: Usalo quando hai capito l'area (es. Azienda) per far confermare all'utente con un bottone grafico.
3. **[DIRECT_LINK: NOME_AVVOCATO]**: Usalo alla fine della conversazione per dare il link diretto al profilo o alla prenotazione.

### LOGIC & TRIAGE ###
1. **Ascolto:** Ricevi il problema.
2. **Ragionamento (Log):** Spiega brevemente cosa stai analizzando (es. "Analisi ambito: Diritto del Lavoro -> Verifica posizione: Datore").
3. **Qualificazione:** Fai una domanda specifica ma naturale.
4. **Conclusione:** Mostra la Card di conferma e fornisci il link al Partner di riferimento.

### KNOWLEDGE BASE (Riassunto Professionisti) ###
- **Diritto Penale/M&A:** Avv. Francesco Vaccaro [Link: /team/vaccaro]
- **Civile/Assicurazioni:** Avv. Renato Piero Biasci [Link: /team/biasci]
- **Diritto del Lavoro:** Prof. Pasquale Passalacqua [Link: /team/passalacqua]
- **Amministrativo:** Avv. Giovanni Puntarello [Link: /team/puntarello]
(Usa i link interni come sopra).
`;

  const chatSchema = z.object({
    message: z.string().min(1).max(2000),
    history: z.array(z.object({
      role: z.enum(["user", "model"]),
      parts: z.array(z.object({ text: z.string() })),
    })).optional().default([]),
  });

  const chatRateLimit = new Map<string, { count: number; resetAt: number }>();
  const CHAT_RATE_LIMIT = 20;
  const CHAT_RATE_WINDOW = 60 * 1000;

  app.post("/api/chat", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = chatRateLimit.get(ip);
    if (entry && now < entry.resetAt) {
      if (entry.count >= CHAT_RATE_LIMIT) {
        return res.status(429).json({ message: "Troppi messaggi. Attendi un momento." });
      }
      entry.count++;
    } else {
      chatRateLimit.set(ip, { count: 1, resetAt: now + CHAT_RATE_WINDOW });
    }

    try {
      const apiKey = process.env.GOOGLE_API_KEY_LEGALIT;
      if (!apiKey) {
        return res.status(500).json({ message: "Chatbot non configurato" });
      }

      const parsed = chatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Messaggio non valido" });
      }

      const { message, history } = parsed.data;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        ...(systemInstruction ? { systemInstruction } : {}),
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = result.response.text();

      res.json({ reply: response });
    } catch (error: any) {
      console.error("Gemini chat error:", error?.message || error);
      res.status(500).json({ message: "Errore nel chatbot. Riprova." });
    }
  });

  return httpServer;
}
