import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { slugifyName } from "@shared/slugify";
import {
  SITE_URL,
  buildArticleMeta,
  buildProfessionalMeta,
  extractSlugFromPath,
  getCanonicalUrl,
  injectCanonical,
  injectProfessionalMeta,
} from "./metaInjection";

function getPathname(req: Request): string {
  // In Express 5, req.path inside `app.use("/{*path}", ...)` is relative to
  // the mount and returns "/". Parse req.originalUrl so we get the absolute
  // request path regardless of how the middleware was mounted.
  const raw = req.originalUrl || req.url || "/";
  const qIdx = raw.indexOf("?");
  return qIdx === -1 ? raw : raw.slice(0, qIdx);
}

async function renderIndexHtml(template: string, req: Request): Promise<string> {
  const pathname = getPathname(req);
  const slug = extractSlugFromPath(pathname);
  if (slug) {
    try {
      let professional = await storage.getProfessionalBySlug(slug);
      if (!professional) {
        const all = await storage.getAllProfessionals().catch(() => []);
        professional = all.find(p => !p.slug && slugifyName(p.name) === slug);
      }
      if (professional) {
        const profUrl = `${SITE_URL}/professionisti/${professional.slug || slug}`;
        const meta = buildProfessionalMeta(professional, profUrl);
        return injectProfessionalMeta(template, meta);
      }
    } catch (err) {
      console.error("[static] professional meta injection failed:", err);
    }
  }

  if (pathname === "/news" || pathname === "/news/") {
    const articleQuery = req.query?.article;
    const articleIdRaw = Array.isArray(articleQuery) ? articleQuery[0] : articleQuery;
    const articleId = articleIdRaw != null ? Number(articleIdRaw) : NaN;
    if (Number.isFinite(articleId) && articleId > 0) {
      try {
        const article = await storage.getNewsArticle(articleId);
        if (article) {
          const articleUrl = `${SITE_URL}/news?article=${article.id}`;
          const meta = buildArticleMeta(article, articleUrl);
          return injectProfessionalMeta(template, meta);
        }
      } catch (err) {
        console.error("[static] news article meta injection failed:", err);
      }
    }
  }

  return injectCanonical(template, getCanonicalUrl(pathname));
}

export { renderIndexHtml };

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexHtmlPath = path.resolve(distPath, "index.html");
  const indexHtml = fs.existsSync(indexHtmlPath)
    ? fs.readFileSync(indexHtmlPath, "utf-8")
    : "";

  const hasCanonicalMarker = indexHtml.includes('id="canonical-tag"');
  if (!hasCanonicalMarker) {
    console.error(
      "[static] WARNING: built index.html does not contain id=\"canonical-tag\" — canonical injection will be a no-op!",
    );
  }

  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      },
    }),
  );

  app.use("/{*path}", async (req: Request, res: Response) => {
    const html = await renderIndexHtml(indexHtml, req);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
