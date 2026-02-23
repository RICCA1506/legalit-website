import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

interface DevData {
  users: any[];
  professionals: any[];
  news_articles: any[];
  news_categories: any[];
  newsletter_subscribers: any[];
  site_settings: any[];
}

export async function syncDevDataToCurrentDb() {
  let currentDir: string;
  try {
    currentDir = path.dirname(fileURLToPath(import.meta.url));
  } catch {
    currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  }
  
  const possiblePaths = [
    path.join(currentDir, "dev_data.json"),
    path.join(process.cwd(), "server", "dev_data.json"),
    path.join(process.cwd(), "dist", "dev_data.json"),
  ];
  
  let dataPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dataPath = p;
      break;
    }
  }
  
  if (!dataPath) {
    console.log("[Sync] No dev_data.json found in any expected location, skipping sync");
    console.log("[Sync] Searched:", possiblePaths.join(", "));
    return { synced: false, reason: "no data file" };
  }
  
  console.log("[Sync] Found data file at:", dataPath);

  const rawData = fs.readFileSync(dataPath, "utf-8");
  const data: DevData = JSON.parse(rawData);
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM news_articles");
    await client.query("DELETE FROM news_categories");
    await client.query("DELETE FROM newsletter_subscribers");
    await client.query("DELETE FROM professionals");
    await client.query("DELETE FROM audit_logs");
    await client.query("DELETE FROM email_login_codes");
    await client.query("DELETE FROM password_reset_tokens");
    await client.query("DELETE FROM partner_invites");
    await client.query("DELETE FROM sessions");
    await client.query("DELETE FROM site_settings");
    await client.query("DELETE FROM users");

    console.log("[Sync] Cleared all tables");

    const seedPassword = process.env.SEED_USER_PASSWORD;
    if (!seedPassword) {
      throw new Error("[Sync] SEED_USER_PASSWORD environment variable is required to seed user accounts.");
    }
    const hashedPassword = await bcrypt.hash(seedPassword, 10);

    for (const user of data.users) {
      await client.query(
        `INSERT INTO users (id, email, hashed_password, first_name, last_name, role, profile_image_url, two_factor_secret, two_factor_enabled, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, hashedPassword, user.first_name, user.last_name, user.role, user.profile_image_url, user.two_factor_secret || null, user.two_factor_enabled, user.created_at, user.updated_at]
      );
    }
    console.log(`[Sync] Inserted ${data.users.length} users`);

    for (const prof of data.professionals) {
      await client.query(
        `INSERT INTO professionals (id, name, title, office, email, phone, full_bio, education, languages, image_url, image_position, image_zoom, order_index, created_at, updated_at, specializations, role, pec) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO NOTHING`,
        [prof.id, prof.name, prof.title, prof.office, prof.email, prof.phone, prof.full_bio, prof.education, prof.languages, prof.image_url, prof.image_position || "center", prof.image_zoom || 100, prof.order_index, prof.created_at, prof.updated_at, prof.specializations, prof.role, prof.pec]
      );
    }
    console.log(`[Sync] Inserted ${data.professionals.length} professionals`);
    await client.query("SELECT setval('professionals_id_seq', (SELECT COALESCE(MAX(id), 0) FROM professionals))");

    for (const article of data.news_articles) {
      await client.query(
        `INSERT INTO news_articles (id, title, content, excerpt, category, image_url, image_position, image_zoom, read_time, author_id, author_name, created_at, updated_at, document_url, document_name, news_type, macro_category, micro_category, linkedin_url, linked_professional_id, linked_professional_ids, linked_practice_area, tags, linkedin_summary) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
         ON CONFLICT (id) DO NOTHING`,
        [article.id, article.title, article.content, article.excerpt, article.category, article.image_url, article.image_position || "50,50", article.image_zoom || 100, article.read_time, article.author_id, article.author_name, article.created_at, article.updated_at, article.document_url, article.document_name, article.news_type, article.macro_category, article.micro_category, article.linkedin_url, article.linked_professional_id, article.linked_professional_ids, article.linked_practice_area, article.tags, article.linkedin_summary]
      );
    }
    console.log(`[Sync] Inserted ${data.news_articles.length} news articles`);
    if (data.news_articles.length > 0) {
      await client.query("SELECT setval('news_articles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM news_articles))");
    }

    for (const cat of data.news_categories) {
      await client.query(
        `INSERT INTO news_categories (id, name, name_en, type, parent_category, is_default, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.name_en, cat.type, cat.parent_category, cat.is_default, cat.created_at]
      );
    }
    console.log(`[Sync] Inserted ${data.news_categories.length} news categories`);
    if (data.news_categories.length > 0) {
      await client.query("SELECT setval('news_categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM news_categories))");
    }

    for (const sub of data.newsletter_subscribers) {
      await client.query(
        `INSERT INTO newsletter_subscribers (id, email, subscribed_at, unsubscribed_at, source) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [sub.id, sub.email, sub.subscribed_at, sub.unsubscribed_at, sub.source]
      );
    }
    console.log(`[Sync] Inserted ${data.newsletter_subscribers.length} newsletter subscribers`);
    if (data.newsletter_subscribers.length > 0) {
      await client.query("SELECT setval('newsletter_subscribers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM newsletter_subscribers))");
    }

    for (const setting of data.site_settings) {
      await client.query(
        `INSERT INTO site_settings (key, value, updated_at) 
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3`,
        [setting.key, setting.value, setting.updated_at]
      );
    }
    console.log(`[Sync] Inserted ${data.site_settings.length} site settings`);

    await client.query("COMMIT");
    console.log("[Sync] Data sync completed successfully!");

    return {
      synced: true,
      counts: {
        users: data.users.length,
        professionals: data.professionals.length,
        news_articles: data.news_articles.length,
        news_categories: data.news_categories.length,
        newsletter_subscribers: data.newsletter_subscribers.length,
        site_settings: data.site_settings.length,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[Sync] Error during data sync:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
