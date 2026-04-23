import { Pool } from "pg";
import fs from "fs";
import path from "path";

export async function exportDevData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const usersResult = await client.query(
      "SELECT id, email, first_name, last_name, role, profile_image_url, two_factor_secret, two_factor_enabled, created_at, updated_at FROM users ORDER BY created_at"
    );

    const professionalsResult = await client.query(
      "SELECT id, name, title, office, email, phone, full_bio, education, languages, image_url, image_position, image_zoom, order_index, created_at, updated_at, specializations, role, pec FROM professionals ORDER BY order_index"
    );

    const newsResult = await client.query(
      "SELECT id, title, content, excerpt, category, image_url, image_position, image_zoom, read_time, author_id, author_name, created_at, updated_at, document_url, document_name, news_type, macro_category, micro_category, linkedin_url, linked_professional_id, linked_professional_ids, linked_practice_area, tags, linkedin_summary, slug FROM news_articles ORDER BY id"
    );

    const categoriesResult = await client.query(
      "SELECT id, name, name_en, type, parent_category, is_default, created_at FROM news_categories ORDER BY id"
    );

    const subscribersResult = await client.query(
      "SELECT id, email, subscribed_at, unsubscribed_at, source FROM newsletter_subscribers ORDER BY id"
    );

    const settingsResult = await client.query(
      "SELECT key, value, updated_at FROM site_settings ORDER BY key"
    );

    const data = {
      users: usersResult.rows,
      professionals: professionalsResult.rows,
      news_articles: newsResult.rows,
      news_categories: categoriesResult.rows,
      newsletter_subscribers: subscribersResult.rows,
      site_settings: settingsResult.rows,
    };

    const outputPath = path.join(process.cwd(), "server", "dev_data.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`[Export] Exported dev data to ${outputPath}`);
    console.log(`[Export] Professionals: ${data.professionals.length}, News: ${data.news_articles.length}, Users: ${data.users.length}`);

    return data;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1]?.includes("exportDevData")) {
  exportDevData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Export] Failed:", err);
      process.exit(1);
    });
}
