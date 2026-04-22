/**
 * One-time backfill for `professionals.slug`.
 *
 * Context:
 *   The `slug` column was added to the `professionals` table to support
 *   semantic profile URLs (`/professionisti/avv-francesco-vaccaro` etc.).
 *   When the column was added it was nullable; this script populates a
 *   unique slug for every row that does not yet have one, so the column
 *   can safely be promoted to `NOT NULL UNIQUE`.
 *
 * Idempotency:
 *   - Rows that already have a non-empty slug are left untouched.
 *   - Slugs are derived deterministically via `slugifyName(name)` and made
 *     unique against the existing slug set by appending `-2`, `-3`, etc.
 *
 * Usage:
 *   tsx server/migrations/backfillProfessionalSlugs.ts
 *
 * Note: As of Apr 2026 this script has already been executed once in
 * production and dev: all 26 professionals received a slug, and the column
 * was promoted to `NOT NULL UNIQUE`. The script is kept in the repo so it
 * can be re-run safely on any future environment that ends up with NULL
 * slugs (e.g. a fresh DB created from older snapshots).
 */
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

  return {
    total: all.length,
    populated: all.length - updated,
    updated,
  };
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
