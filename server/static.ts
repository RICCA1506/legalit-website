import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

const SITE_URL = "https://legalit.it";

function getCanonicalUrl(req: Request): string {
  const pathname = req.path;
  if (pathname === "/professionisti") {
    const id = req.query.id;
    if (id) return `${SITE_URL}/professionisti?id=${id}`;
  }
  if (pathname === "/" || !pathname) return SITE_URL;
  return `${SITE_URL}${pathname}`;
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
    const html = indexHtml.replace(
      /(<link\s[^>]*rel="canonical"[^>]*href=")[^"]*"/,
      `$1${canonical}"`
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
