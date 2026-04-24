import { Pool, PoolClient } from "pg";
import crypto from "crypto";
import { slugifyName, uniqueSlug } from "../shared/slugify";

const DRY_RUN = process.argv.includes("--dry-run");
const URL = process.env.PROD_DATABASE_URL;

if (!URL) {
  console.error("PROD_DATABASE_URL is not set");
  process.exit(1);
}

function log(...args: unknown[]) {
  console.log("[align-prod]", ...args);
}

async function constraintExists(client: PoolClient, table: string, name: string): Promise<boolean> {
  const r = await client.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.table_constraints
       WHERE table_schema = 'public' AND table_name = $1 AND constraint_name = $2
     ) AS exists;`,
    [table, name],
  );
  return r.rows[0].exists;
}

async function columnInfo(client: PoolClient, table: string, column: string): Promise<{ exists: boolean; nullable: boolean | null }> {
  const r = await client.query<{ is_nullable: string }>(
    `SELECT is_nullable FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2;`,
    [table, column],
  );
  if (r.rowCount === 0) return { exists: false, nullable: null };
  return { exists: true, nullable: r.rows[0].is_nullable === "YES" };
}

async function snapshotState(client: PoolClient) {
  const counts = await client.query<{ t: string; c: string }>(
    `SELECT 'newsletter_subscribers' AS t, COUNT(*)::text AS c FROM newsletter_subscribers
     UNION ALL SELECT 'news_articles', COUNT(*)::text FROM news_articles
     UNION ALL SELECT 'professionals', COUNT(*)::text FROM professionals;`,
  );
  const profSlug = await columnInfo(client, "professionals", "slug");
  const newsSlug = await columnInfo(client, "news_articles", "slug");
  const newsSlugUnique = await constraintExists(client, "news_articles", "news_articles_slug_unique");
  const nlTok = await columnInfo(client, "newsletter_subscribers", "unsubscribe_token");
  const nlTokUnique = await constraintExists(client, "newsletter_subscribers", "newsletter_subscribers_unsubscribe_token_unique");
  return {
    counts: counts.rows.map((r) => `${r.t}=${r.c}`).join(", "),
    professionals_slug: `exists=${profSlug.exists} nullable=${profSlug.nullable}`,
    news_articles_slug: `exists=${newsSlug.exists} nullable=${newsSlug.nullable} unique_constraint=${newsSlugUnique}`,
    newsletter_unsubscribe_token: `exists=${nlTok.exists} nullable=${nlTok.nullable} unique_constraint=${nlTokUnique}`,
  };
}

async function main() {
  const pool = new Pool({ connectionString: URL });
  const client = await pool.connect();
  try {
    log(`mode = ${DRY_RUN ? "DRY-RUN (rolled back at end)" : "WRITE (committed)"}`);
    log("BEFORE:", JSON.stringify(await snapshotState(client), null, 2));

    await client.query("BEGIN");

    // === Step 1: professionals.slug DROP NOT NULL (idempotent) ===
    const profSlugBefore = await columnInfo(client, "professionals", "slug");
    if (profSlugBefore.exists && profSlugBefore.nullable === false) {
      const sql = `ALTER TABLE professionals ALTER COLUMN slug DROP NOT NULL;`;
      log(`STEP 1: ${sql}`);
      await client.query(sql);
    } else {
      log(`STEP 1: SKIP (professionals.slug already nullable or missing)`);
    }

    // === Step 2: news_articles.slug ADD COLUMN if missing, or DROP NOT NULL if drifted ===
    const newsSlugBefore = await columnInfo(client, "news_articles", "slug");
    if (!newsSlugBefore.exists) {
      const sql = `ALTER TABLE news_articles ADD COLUMN slug VARCHAR(255);`;
      log(`STEP 2: ${sql}`);
      await client.query(sql);
    } else if (newsSlugBefore.nullable === false) {
      const sql = `ALTER TABLE news_articles ALTER COLUMN slug DROP NOT NULL;`;
      log(`STEP 2: column exists but NOT NULL — ${sql}`);
      await client.query(sql);
    } else {
      log(`STEP 2: SKIP (news_articles.slug already exists and nullable)`);
    }

    // === Step 3: backfill news_articles.slug from titles where NULL ===
    const articles = await client.query<{ id: number; title: string; slug: string | null }>(
      `SELECT id, title, slug FROM news_articles ORDER BY id;`,
    );
    const taken = new Set<string>(
      articles.rows
        .map((r) => r.slug)
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0),
    );
    let articlesUpdated = 0;
    for (const row of articles.rows) {
      if (typeof row.slug === "string" && row.slug.trim().length > 0) continue;
      const base = slugifyName(row.title) || `articolo-${row.id}`;
      const finalSlug = uniqueSlug(base, taken);
      taken.add(finalSlug);
      log(`STEP 3: news_article id=${row.id} -> slug="${finalSlug}"`);
      await client.query(`UPDATE news_articles SET slug = $1 WHERE id = $2;`, [finalSlug, row.id]);
      articlesUpdated++;
    }
    log(`STEP 3: ${articlesUpdated} article slug(s) backfilled, ${articles.rows.length - articlesUpdated} already had slug`);

    // === Step 4: news_articles_slug_unique constraint if missing ===
    const newsSlugUniqueExists = await constraintExists(client, "news_articles", "news_articles_slug_unique");
    if (!newsSlugUniqueExists) {
      const sql = `ALTER TABLE news_articles ADD CONSTRAINT news_articles_slug_unique UNIQUE (slug);`;
      log(`STEP 4: ${sql}`);
      await client.query(sql);
    } else {
      log(`STEP 4: SKIP (news_articles_slug_unique already exists)`);
    }

    // === Step 5: newsletter_subscribers.unsubscribe_token ADD COLUMN if missing (nullable initially) ===
    const tokenBefore = await columnInfo(client, "newsletter_subscribers", "unsubscribe_token");
    if (!tokenBefore.exists) {
      const sql = `ALTER TABLE newsletter_subscribers ADD COLUMN unsubscribe_token VARCHAR(64);`;
      log(`STEP 5: ${sql}`);
      await client.query(sql);
    } else {
      log(`STEP 5: SKIP (newsletter_subscribers.unsubscribe_token already exists)`);
    }

    // === Step 6: backfill unsubscribe_token with random 64-char hex where NULL ===
    const subs = await client.query<{ id: number; email: string; unsubscribe_token: string | null }>(
      `SELECT id, email, unsubscribe_token FROM newsletter_subscribers ORDER BY id;`,
    );
    let tokensUpdated = 0;
    for (const row of subs.rows) {
      if (typeof row.unsubscribe_token === "string" && row.unsubscribe_token.length > 0) continue;
      const tok = crypto.randomBytes(32).toString("hex");
      log(`STEP 6: newsletter id=${row.id} -> token assigned (64 chars)`);
      await client.query(`UPDATE newsletter_subscribers SET unsubscribe_token = $1 WHERE id = $2;`, [tok, row.id]);
      tokensUpdated++;
    }
    log(`STEP 6: ${tokensUpdated} token(s) backfilled, ${subs.rows.length - tokensUpdated} already had token`);

    // === Step 7: SET NOT NULL on unsubscribe_token, only if no NULLs remain ===
    const nullToks = await client.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM newsletter_subscribers WHERE unsubscribe_token IS NULL;`,
    );
    if (Number(nullToks.rows[0].c) === 0) {
      const tokenAfter = await columnInfo(client, "newsletter_subscribers", "unsubscribe_token");
      if (tokenAfter.nullable !== false) {
        const sql = `ALTER TABLE newsletter_subscribers ALTER COLUMN unsubscribe_token SET NOT NULL;`;
        log(`STEP 7: ${sql}`);
        await client.query(sql);
      } else {
        log(`STEP 7: SKIP (unsubscribe_token already NOT NULL)`);
      }
    } else {
      throw new Error(`STEP 7 ABORT: ${nullToks.rows[0].c} NULL token(s) remaining (backfill failed)`);
    }

    // === Step 8: newsletter_subscribers_unsubscribe_token_unique constraint if missing ===
    const tokUniqueExists = await constraintExists(
      client,
      "newsletter_subscribers",
      "newsletter_subscribers_unsubscribe_token_unique",
    );
    if (!tokUniqueExists) {
      const sql = `ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_unsubscribe_token_unique UNIQUE (unsubscribe_token);`;
      log(`STEP 8: ${sql}`);
      await client.query(sql);
    } else {
      log(`STEP 8: SKIP (unsubscribe_token unique constraint already exists)`);
    }

    log("AFTER (in-tx):", JSON.stringify(await snapshotState(client), null, 2));

    if (DRY_RUN) {
      await client.query("ROLLBACK");
      log("DRY-RUN: rolled back, no changes persisted");
    } else {
      await client.query("COMMIT");
      log("COMMITTED");
    }

    log("FINAL (post-tx):", JSON.stringify(await snapshotState(client), null, 2));
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    console.error("[align-prod] ERROR, rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
