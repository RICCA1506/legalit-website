import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

const SITE_URL = "https://legalit.it";

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getCanonicalUrl(req: Request): string {
  const pathname = req.path;
  if (pathname === "/professionisti") {
    const rawId = req.query.id;
    if (rawId) {
      const id = escapeHtmlAttr(String(rawId).replace(/[^0-9]/g, ""));
      if (id) return `${SITE_URL}/professionisti?id=${id}`;
    }
  }
  if (pathname === "/" || !pathname) return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

function replaceMetaContent(html: string, attr: string, value: string, newContent: string): string {
  const marker = `${attr}="${value}"`;
  const pos = html.indexOf(marker);
  if (pos === -1) return html;

  const tagStart = html.lastIndexOf("<meta", pos);
  if (tagStart === -1) return html;

  const tagEnd = html.indexOf(">", pos);
  if (tagEnd === -1) return html;

  const tag = html.slice(tagStart, tagEnd + 1);
  const updated = tag.replace(/content="[^"]*"/, `content="${newContent}"`);
  return html.slice(0, tagStart) + updated + html.slice(tagEnd + 1);
}

function injectCanonical(html: string, canonical: string): string {
  const CANONICAL_ID = 'id="canonical-tag"';
  const idPos = html.indexOf(CANONICAL_ID);
  if (idPos === -1) return html;

  const linkStart = html.lastIndexOf("<link", idPos);
  if (linkStart === -1) return html;

  const tagEnd = html.indexOf(">", idPos);
  if (tagEnd === -1) return html;

  const linkTag = html.slice(linkStart, tagEnd + 1);
  const newLinkTag = linkTag.replace(/href="[^"]*"/, `href="${canonical}"`);
  let result = html.slice(0, linkStart) + newLinkTag + html.slice(tagEnd + 1);

  result = replaceMetaContent(result, 'property', 'og:url', canonical);

  return result;
}

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

  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
      },
    }),
  );

  app.use("/{*path}", (req: Request, res: Response) => {
    const canonical = getCanonicalUrl(req);
    const html = injectCanonical(indexHtml, canonical);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
