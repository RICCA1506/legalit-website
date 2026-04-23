import { Pool } from "pg";
import { slugifyName, uniqueSlug } from "../shared/slugify";

const DRY_RUN = process.argv.includes("--dry-run");
const URL = process.env.PROD_DATABASE_URL;

if (!URL) {
  console.error("PROD_DATABASE_URL is not set");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: URL });
  const client = await pool.connect();
  try {
    console.log(`[backfill] mode = ${DRY_RUN ? "DRY-RUN" : "WRITE"}`);

    const colExistsBefore = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'news_articles' AND column_name = 'slug'
      ) AS exists;`,
    );
    console.log(`[backfill] slug column exists in prod: ${colExistsBefore.rows[0].exists}`);

    await client.query("BEGIN");

    const addColSql = `ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`;
    if (!colExistsBefore.rows[0].exists) {
      console.log(`[backfill] ${DRY_RUN ? "WOULD RUN (executed inside dry-run tx, will be rolled back)" : "RUN"}: ${addColSql}`);
    }
    await client.query(addColSql);

    const rowsRes = await client.query<{ id: number; title: string; slug: string | null }>(
      `SELECT id, title, slug FROM news_articles ORDER BY id;`,
    );
    const rows = rowsRes.rows;
    console.log(`[backfill] found ${rows.length} articles in prod`);

    const taken = new Set<string>(
      rows
        .map((r) => r.slug)
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0),
    );

    let updated = 0;
    let skipped = 0;
    for (const row of rows) {
      if (typeof row.slug === "string" && row.slug.trim().length > 0) {
        skipped++;
        continue;
      }
      const base = slugifyName(row.title) || `articolo-${row.id}`;
      const finalSlug = uniqueSlug(base, taken);
      taken.add(finalSlug);
      console.log(`[backfill]   id=${row.id}  title="${row.title.slice(0, 60)}"  ->  ${finalSlug}`);
      if (!DRY_RUN) {
        await client.query(`UPDATE news_articles SET slug = $1 WHERE id = $2;`, [
          finalSlug,
          row.id,
        ]);
      }
      updated++;
    }
    console.log(`[backfill] ${updated} ${DRY_RUN ? "would be" : ""} updated, ${skipped} already had slug`);

    const nullsRes = await client.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM news_articles WHERE slug IS NULL OR slug = '';`,
    );
    const remainingNulls = Number(nullsRes.rows[0].c);
    console.log(`[backfill] remaining NULL/empty slugs after backfill: ${remainingNulls}`);

    if (remainingNulls === 0) {
      const sql = `ALTER TABLE news_articles ALTER COLUMN slug SET NOT NULL;`;
      console.log(`[backfill] ${DRY_RUN ? "WOULD RUN" : "RUN"}: ${sql}`);
      if (!DRY_RUN) await client.query(sql);
    } else {
      console.log("[backfill] SKIP SET NOT NULL (some rows still NULL)");
    }

    const conRes = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'news_articles' AND constraint_name = 'news_articles_slug_unique'
      ) AS exists;`,
    );
    if (!conRes.rows[0].exists) {
      const sql = `ALTER TABLE news_articles ADD CONSTRAINT news_articles_slug_unique UNIQUE (slug);`;
      console.log(`[backfill] ${DRY_RUN ? "WOULD RUN" : "RUN"}: ${sql}`);
      if (!DRY_RUN) await client.query(sql);
    } else {
      console.log("[backfill] unique constraint already present, skipping");
    }

    if (DRY_RUN) {
      await client.query("ROLLBACK");
      console.log("[backfill] DRY-RUN: rolled back, no changes persisted");
    } else {
      await client.query("COMMIT");
      console.log("[backfill] COMMITTED");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[backfill] ERROR, rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
