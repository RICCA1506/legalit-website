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

export function uniqueSlug(base: string, existingSlugs: Iterable<string>): string {
  const set = new Set(existingSlugs);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export function professionalUrl(p: { slug?: string | null; name: string }): string {
  const slug = (p.slug && p.slug.trim()) || slugifyName(p.name);
  return `/professionisti/${slug}`;
}

export function articleUrl(a: { slug?: string | null; title: string; id?: number }): string {
  const slug = (a.slug && a.slug.trim()) || slugifyName(a.title) || (a.id ? `articolo-${a.id}` : "");
  return `/news/${slug}`;
}
