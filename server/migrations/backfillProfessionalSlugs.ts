import { eq } from "drizzle-orm";
import { db } from "../db";
import { professionals, type Professional } from "@shared/schema";
import { slugifyName, uniqueSlug } from "@shared/slugify";

export async function backfillProfessionalSlugs(): Promise<{
  total: number;
  populated: number;
  updated: number;
}> {
  const all: Professional[] = await db.select().from(professionals);
  const taken = new Set<string>(
    all
      .map((r) => r.slug)
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0),
  );

  let updated = 0;
  for (const row of all) {
    if (typeof row.slug === "string" && row.slug.trim().length > 0) continue;
    const base = slugifyName(row.name) || `prof-${row.id}`;
    const finalSlug = uniqueSlug(base, taken);
    taken.add(finalSlug);
    await db
      .update(professionals)
      .set({ slug: finalSlug })
      .where(eq(professionals.id, row.id));
    updated++;
  }

  return { total: all.length, populated: all.length - updated, updated };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backfillProfessionalSlugs()
    .then((res) => {
      console.log("[backfill] done:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[backfill] failed:", err);
      process.exit(1);
    });
}
