/**
 * Route registry condiviso tra static.ts (per il fallback 404) e routes.ts
 * (per la generazione della sitemap). Tenere allineato con
 * client/src/App.tsx > <Router /> ogni volta che si aggiunge una route.
 */

/**
 * Path SPA statici (senza parametri dinamici). Devono restituire HTTP 200 con
 * la SPA. Tutto il resto, se non matcha un pattern dinamico, è un 404.
 */
export const STATIC_SPA_ROUTES: ReadonlySet<string> = new Set([
  "/",
  "/attivita",
  "/professionisti",
  "/sedi",
  "/news",
  "/contatti",
  "/area-riservata",
  "/login",
  "/password-dimenticata",
  "/reset-password",
  "/registrazione",
  "/newsletter",
  "/lavora-con-noi",
  "/privacy",
  "/cookies",
  "/termini",
]);

/**
 * Slug delle aree pratica valide per /attivita/:slug. Anche usato dalla
 * sitemap.
 */
export const PRACTICE_AREA_SLUGS: ReadonlyArray<string> = [
  "diritto-lavoro", "diritto-penale", "diritto-civile-commerciale",
  "corporate-compliance", "diritto-societario-ma", "banking-finance",
  "diritto-assicurazioni", "crisi-impresa", "recupero-crediti-npl",
  "diritto-amministrativo", "responsabilita-contabile", "ambiente-energia",
  "affari-regolatori", "diritto-sport", "diritto-tributario",
  "diritto-sanitario", "ia-privacy-cybersecurity", "real-estate",
  "tutela-patrimoni-famiglia", "terzo-settore",
];

const PRACTICE_AREA_SLUG_SET: ReadonlySet<string> = new Set(PRACTICE_AREA_SLUGS);

const PROFESSIONAL_PATH_RE = /^\/professionisti\/([^/]+)\/?$/;
const NEWS_PATH_RE = /^\/news\/([^/]+)\/?$/;
const ACTIVITY_PATH_RE = /^\/attivita\/([^/]+)\/?$/;
const ADMIN_PATH_RE = /^\/area-riservata(\/.*)?$/;
const SLUG_RE = /^[a-z0-9-]+$/;

export interface DynamicMatch {
  kind: "professional" | "news" | "activity" | "admin";
  slug: string | null;
}

/**
 * Determina se `pathname` matcha un pattern dinamico SPA. Restituisce il tipo
 * di route + lo slug (per i tipi che ne hanno uno) per consentire al chiamante
 * di validare contro il DB / la lista statica.
 *
 * Note: lo slug è normalizzato (lowercase) e validato contro [a-z0-9-]+.
 * Slug non validi (es. UPPERCASE, spazi, caratteri speciali) restituiscono
 * `null` come slug in modo che il chiamante possa trattarli come 404.
 */
export function matchDynamicRoute(pathname: string): DynamicMatch | null {
  if (ADMIN_PATH_RE.test(pathname)) {
    return { kind: "admin", slug: null };
  }

  let m = pathname.match(PROFESSIONAL_PATH_RE);
  if (m) {
    const slug = m[1].toLowerCase();
    return { kind: "professional", slug: SLUG_RE.test(slug) ? slug : null };
  }

  m = pathname.match(NEWS_PATH_RE);
  if (m) {
    const slug = m[1].toLowerCase();
    return { kind: "news", slug: SLUG_RE.test(slug) ? slug : null };
  }

  m = pathname.match(ACTIVITY_PATH_RE);
  if (m) {
    const slug = m[1].toLowerCase();
    return { kind: "activity", slug: SLUG_RE.test(slug) ? slug : null };
  }

  return null;
}

/**
 * True se `slug` è una pratica valida (sincrono, lookup in-memory).
 */
export function isValidPracticeAreaSlug(slug: string): boolean {
  return PRACTICE_AREA_SLUG_SET.has(slug);
}

/**
 * True se `pathname` è un path statico SPA noto (senza parametri).
 */
export function isStaticSpaRoute(pathname: string): boolean {
  return STATIC_SPA_ROUTES.has(pathname);
}
