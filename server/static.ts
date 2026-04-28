import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { slugifyName } from "@shared/slugify";
import {
  SITE_URL,
  buildArticleMeta,
  buildProfessionalMeta,
  extractNewsSlugFromPath,
  extractSlugFromPath,
  getCanonicalUrl,
  injectCanonical,
  injectProfessionalMeta,
} from "./metaInjection";
import {
  isStaticSpaRoute,
  isValidPracticeAreaSlug,
  matchDynamicRoute,
} from "./routeMap";

function getPathname(req: Request): string {
  // In Express 5, req.path inside `app.use("/{*path}", ...)` is relative to
  // the mount and returns "/". Parse req.originalUrl so we get the absolute
  // request path regardless of how the middleware was mounted.
  const raw = req.originalUrl || req.url || "/";
  const qIdx = raw.indexOf("?");
  let pathname = qIdx === -1 ? raw : raw.slice(0, qIdx);
  // Defense-in-depth: il middleware in server/index.ts già fa 301 per i
  // trailing slash, ma normalizziamo anche qui per essere robusti a future
  // modifiche o invocazioni dirette di renderIndexHtml (es. test).
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Trasforma il template HTML del SPA in una versione "404": canonical alla
 * home (per evitare che il path inesistente si auto-dichiari canonical) +
 * meta robots noindex (per impedire l'indicizzazione anche se Google
 * dovesse ignorare il 404 status).
 */
function makeNotFoundHtml(template: string): string {
  let out = template.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    '<meta name="robots" content="noindex, follow" />',
  );
  out = injectCanonical(out, SITE_URL);
  return out;
}

/**
 * Esito della risoluzione di un path verso una route SPA conosciuta o un
 * record dinamico esistente. `notFound: true` significa che il server deve
 * restituire HTTP 404 con la versione noindex del template.
 */
interface RenderResult {
  html: string;
  notFound: boolean;
}

/**
 * Versione "ricca": restituisce HTML + flag notFound. Usata dalla catch-all di
 * production (serveStatic) per settare lo status HTTP 404 quando opportuno.
 */
async function renderIndexHtmlWithStatus(template: string, req: Request): Promise<RenderResult> {
  const pathname = getPathname(req);

  // 0. Edge case legacy: /news?article=N. L'handler in routes.ts normalmente
  // fa il 301 prima di arrivare qui, ma se qualcosa salta quell'handler
  // (es. modifica futura, race condition) iniettiamo il canonical verso lo
  // slug dell'articolo. Va PRIMA del check static perché /news è anche una
  // route statica e bypasserebbe questo blocco.
  if (pathname === "/news") {
    const articleQuery = req.query?.article;
    const articleIdRaw = Array.isArray(articleQuery) ? articleQuery[0] : articleQuery;
    const articleId = articleIdRaw != null ? Number(articleIdRaw) : NaN;
    if (Number.isFinite(articleId) && articleId > 0) {
      try {
        const article = await storage.getNewsArticle(articleId);
        if (article) {
          const slug = article.slug || slugifyName(article.title) || `articolo-${article.id}`;
          const articleHref = `${SITE_URL}/news/${slug}`;
          const meta = buildArticleMeta(article, articleHref);
          return { html: injectProfessionalMeta(template, meta), notFound: false };
        }
      } catch (err) {
        console.error("[static] news article meta injection failed:", err);
      }
    }
  }

  // 1. Path statici SPA noti → 200 + canonical normale
  if (isStaticSpaRoute(pathname)) {
    return {
      html: injectCanonical(template, getCanonicalUrl(pathname)),
      notFound: false,
    };
  }

  // 2. Pattern dinamici: dispatch in base al kind
  const dyn = matchDynamicRoute(pathname);
  if (dyn) {
    if (dyn.kind === "admin") {
      // Tutti i sottopath di /area-riservata sono gestiti dalla SPA — 200.
      return {
        html: injectCanonical(template, getCanonicalUrl(pathname)),
        notFound: false,
      };
    }

    if (dyn.kind === "activity") {
      if (dyn.slug && isValidPracticeAreaSlug(dyn.slug)) {
        return {
          html: injectCanonical(template, getCanonicalUrl(pathname)),
          notFound: false,
        };
      }
      return { html: makeNotFoundHtml(template), notFound: true };
    }

    if (dyn.kind === "professional") {
      const slug = dyn.slug;
      if (!slug) return { html: makeNotFoundHtml(template), notFound: true };
      try {
        let professional = await storage.getProfessionalBySlug(slug);
        if (!professional) {
          const all = await storage.getAllProfessionals().catch(() => []);
          professional = all.find(p => !p.slug && slugifyName(p.name) === slug);
        }
        if (professional) {
          const profUrl = `${SITE_URL}/professionisti/${professional.slug || slug}`;
          const meta = buildProfessionalMeta(professional, profUrl);
          return { html: injectProfessionalMeta(template, meta), notFound: false };
        }
      } catch (err) {
        console.error("[static] professional meta injection failed:", err);
      }
      return { html: makeNotFoundHtml(template), notFound: true };
    }

    if (dyn.kind === "news") {
      const slug = dyn.slug;
      if (!slug) return { html: makeNotFoundHtml(template), notFound: true };
      try {
        const article = await storage.getNewsArticleBySlug(slug);
        if (article) {
          const canonicalSlug = article.slug || slug;
          const articleHref = `${SITE_URL}/news/${canonicalSlug}`;
          const meta = buildArticleMeta(article, articleHref);
          return { html: injectProfessionalMeta(template, meta), notFound: false };
        }
      } catch (err) {
        console.error("[static] news article (slug) meta injection failed:", err);
      }
      return { html: makeNotFoundHtml(template), notFound: true };
    }
  }

  // 3. Legacy: /news?article=N — l'handler in routes.ts normalmente fa il
  // 301 prima di arrivare qui, ma in edge case potremmo essere chiamati con
  // questa query. Manteniamo il comportamento esistente: 200 con canonical
  // verso lo slug dell'articolo, se trovato.
  if (pathname === "/news") {
    const articleQuery = req.query?.article;
    const articleIdRaw = Array.isArray(articleQuery) ? articleQuery[0] : articleQuery;
    const articleId = articleIdRaw != null ? Number(articleIdRaw) : NaN;
    if (Number.isFinite(articleId) && articleId > 0) {
      try {
        const article = await storage.getNewsArticle(articleId);
        if (article) {
          const slug = article.slug || slugifyName(article.title) || `articolo-${article.id}`;
          const articleHref = `${SITE_URL}/news/${slug}`;
          const meta = buildArticleMeta(article, articleHref);
          return { html: injectProfessionalMeta(template, meta), notFound: false };
        }
      } catch (err) {
        console.error("[static] news article meta injection failed:", err);
      }
    }
  }

  // 4. Tutto il resto → 404 vero (no canonical self-referential, noindex)
  return { html: makeNotFoundHtml(template), notFound: true };
}

/**
 * Versione "string-only" usata da server/vite.ts (file forbidden to edit) che
 * fa `res.status(200).end(renderIndexHtml(...))`. In dev mode lo status sarà
 * sempre 200 (Vite non può sapere del 404), ma l'HTML restituito contiene
 * comunque canonical→home + meta robots noindex per i path inesistenti, che
 * è ciò che importa per la SEO. In production usiamo direttamente
 * `renderIndexHtmlWithStatus` dentro la catch-all di `serveStatic`.
 */
async function renderIndexHtml(template: string, req: Request): Promise<string> {
  const result = await renderIndexHtmlWithStatus(template, req);
  return result.html;
}

export { renderIndexHtml, renderIndexHtmlWithStatus };

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
    const { html, notFound } = await renderIndexHtmlWithStatus(indexHtml, req);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (notFound) res.status(404);
    res.send(html);
  });
}
