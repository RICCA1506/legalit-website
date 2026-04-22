/**
 * Generate a URL-safe slug from a professional's full name.
 * "Avv. Francesco Vaccaro" -> "avv-francesco-vaccaro"
 * "Prof. Avv. Pasquale Passalacqua" -> "prof-avv-pasquale-passalacqua"
 * "Stefano D'Amico" -> "stefano-d-amico"
 */
export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"`’]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * Ensure a slug is unique against an array of existing slugs by appending
 * `-2`, `-3`, etc. when a collision is detected.
 */
/**
 * Build the canonical SPA URL for a professional profile. Always prefer the
 * stored `slug` value; fall back to deterministic `slugifyName(name)` so this
 * helper is safe even for legacy/in-flight records without a slug yet.
 */
export function professionalUrl(p: { slug?: string | null; name: string }): string {
  const slug = (p.slug && p.slug.trim()) || slugifyName(p.name);
  return `/professionisti/${slug}`;
}

export function uniqueSlug(base: string, existingSlugs: Iterable<string>): string {
  const set = new Set(existingSlugs);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
