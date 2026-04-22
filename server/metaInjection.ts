import type { Professional } from "@shared/schema";

const SITE_URL = "https://legalit.it";
const SLUG_RE = /^[a-z0-9-]+$/;
const PROFESSIONAL_PATH_RE = /^\/professionisti\/([^/]+)\/?$/;

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractSlugFromPath(pathname: string): string | null {
  const m = pathname.match(PROFESSIONAL_PATH_RE);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  return SLUG_RE.test(slug) ? slug : null;
}

export function getCanonicalUrl(pathname: string): string {
  const slug = extractSlugFromPath(pathname);
  if (slug) return `${SITE_URL}/professionisti/${slug}`;
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
  const escaped = escapeHtmlAttr(newContent);
  const updated = /content="[^"]*"/.test(tag)
    ? tag.replace(/content="[^"]*"/, `content="${escaped}"`)
    : tag.replace(/<meta\s/, `<meta content="${escaped}" `);
  return html.slice(0, tagStart) + updated + html.slice(tagEnd + 1);
}

function replaceTitle(html: string, newTitle: string): string {
  const titleRe = /<title[^>]*>[^<]*<\/title>/i;
  if (!titleRe.test(html)) return html;
  return html.replace(titleRe, `<title>${escapeHtmlText(newTitle)}</title>`);
}

export function injectCanonical(html: string, canonical: string): string {
  const CANONICAL_ID = 'id="canonical-tag"';
  const idPos = html.indexOf(CANONICAL_ID);
  if (idPos === -1) return html;

  const linkStart = html.lastIndexOf("<link", idPos);
  if (linkStart === -1) return html;

  const tagEnd = html.indexOf(">", idPos);
  if (tagEnd === -1) return html;

  const linkTag = html.slice(linkStart, tagEnd + 1);
  const newLinkTag = linkTag.replace(/href="[^"]*"/, `href="${escapeHtmlAttr(canonical)}"`);
  let result = html.slice(0, linkStart) + newLinkTag + html.slice(tagEnd + 1);

  result = replaceMetaContent(result, "property", "og:url", canonical);

  return result;
}

export interface ProfessionalMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonical: string;
}

export function buildProfessionalMeta(professional: Professional, profUrl: string): ProfessionalMeta {
  const name = professional.name;
  const jobTitle = professional.title || "";
  const bioRaw = stripMd(professional.bio || professional.fullBio || "");
  const bioShort = bioRaw.slice(0, 220);
  const fallbackDesc = jobTitle
    ? `${jobTitle} presso LEGALIT – Società tra Avvocati`
    : `${name} – LEGALIT Società tra Avvocati`;
  const description = bioShort || fallbackDesc;

  const imageRaw = professional.imageUrl || "";
  const image = imageRaw
    ? imageRaw.startsWith("http")
      ? imageRaw
      : `${SITE_URL}${imageRaw.startsWith("/") ? "" : "/"}${imageRaw}`
    : `${SITE_URL}/favicon.png`;

  const titleStr = jobTitle ? `${name} - ${jobTitle} | LEGALIT` : `${name} | LEGALIT`;

  return {
    title: titleStr,
    description,
    ogTitle: `${name} - LEGALIT`,
    ogDescription: description,
    ogImage: image,
    ogType: "profile",
    twitterCard: "summary_large_image",
    twitterTitle: `${name} - LEGALIT`,
    twitterDescription: description,
    twitterImage: image,
    canonical: profUrl,
  };
}

/**
 * Inject per-professional meta tags into the SPA index.html.
 * Replaces title, description, og:*, twitter:*, canonical and og:url
 * so non-crawler clients (browsers, metatags.io, generic OG scrapers)
 * see the right preview without going through the SSR crawler path.
 */
export function injectProfessionalMeta(html: string, meta: ProfessionalMeta): string {
  let out = html;
  out = replaceTitle(out, meta.title);
  out = replaceMetaContent(out, "name", "description", meta.description);
  out = replaceMetaContent(out, "property", "og:type", meta.ogType);
  out = replaceMetaContent(out, "property", "og:title", meta.ogTitle);
  out = replaceMetaContent(out, "property", "og:description", meta.ogDescription);
  out = replaceMetaContent(out, "property", "og:image", meta.ogImage);
  out = replaceMetaContent(out, "name", "twitter:card", meta.twitterCard);
  out = replaceMetaContent(out, "name", "twitter:title", meta.twitterTitle);
  out = replaceMetaContent(out, "name", "twitter:description", meta.twitterDescription);
  // twitter:image may not exist in template; replaceMetaContent is no-op if missing.
  out = replaceMetaContent(out, "name", "twitter:image", meta.twitterImage);
  // Canonical + og:url last so it always reflects the slug URL.
  out = injectCanonical(out, meta.canonical);
  return out;
}

export { SITE_URL };
