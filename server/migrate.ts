import { Pool } from "pg";

export async function ensureSchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        hashed_password VARCHAR,
        first_name VARCHAR,
        last_name VARCHAR,
        role VARCHAR(20) NOT NULL DEFAULT 'partner',
        profile_image_url VARCHAR,
        two_factor_secret VARCHAR(255),
        two_factor_enabled TEXT DEFAULT 'false',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS partner_invites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_by VARCHAR REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        actor_id VARCHAR,
        actor_email VARCHAR(255),
        target_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        details TEXT,
        success TEXT DEFAULT 'true',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        news_type VARCHAR(50) DEFAULT 'studio',
        macro_category VARCHAR(100),
        micro_category VARCHAR(100),
        linked_professional_id VARCHAR(50),
        linked_practice_area VARCHAR(100),
        tags TEXT[],
        linkedin_url VARCHAR(500),
        image_url VARCHAR(500),
        document_url VARCHAR(500),
        document_name VARCHAR(255),
        read_time VARCHAR(20),
        author_id VARCHAR REFERENCES users(id),
        author_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS news_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        type VARCHAR(20) NOT NULL,
        parent_category VARCHAR(100),
        is_default TEXT DEFAULT 'false',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS professionals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'Associate',
        specializations TEXT[],
        office VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        pec VARCHAR(255),
        phone VARCHAR(50),
        full_bio TEXT,
        education TEXT[],
        languages TEXT[],
        image_url VARCHAR(500),
        image_position VARCHAR(20) DEFAULT 'center',
        order_index SERIAL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT NOW(),
        unsubscribed_at TIMESTAMP,
        source VARCHAR(50) DEFAULT 'website'
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        target_email VARCHAR(255) DEFAULT 'info@legalit.it',
        is_read TEXT DEFAULT 'false',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS email_login_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL,
        lang VARCHAR(10) NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        message_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await addUniqueConstraintIfNotExists(pool, 'partner_invites', 'email', 'partner_invites_email_unique');
    await addUniqueConstraintIfNotExists(pool, 'partner_invites', 'token_hash', 'partner_invites_token_hash_unique');
    await addUniqueConstraintIfNotExists(pool, 'users', 'email', 'users_email_unique');
    await addUniqueConstraintIfNotExists(pool, 'newsletter_subscribers', 'email', 'newsletter_subscribers_email_unique');
    await addUniqueConstraintIfNotExists(pool, 'password_reset_tokens', 'token_hash', 'password_reset_tokens_token_hash_unique');

    await addColumnIfNotExists(pool, 'news_articles', 'news_type', "VARCHAR(50) DEFAULT 'studio'");
    await addColumnIfNotExists(pool, 'news_articles', 'macro_category', 'VARCHAR(100)');
    await addColumnIfNotExists(pool, 'news_articles', 'micro_category', 'VARCHAR(100)');
    await addColumnIfNotExists(pool, 'news_articles', 'linked_professional_id', 'VARCHAR(50)');
    await addColumnIfNotExists(pool, 'news_articles', 'linked_practice_area', 'VARCHAR(100)');
    await addColumnIfNotExists(pool, 'news_articles', 'tags', 'TEXT[]');
    await addColumnIfNotExists(pool, 'news_articles', 'linkedin_url', 'VARCHAR(500)');
    await addColumnIfNotExists(pool, 'news_articles', 'document_url', 'VARCHAR(500)');
    await addColumnIfNotExists(pool, 'news_articles', 'document_name', 'VARCHAR(255)');
    await addColumnIfNotExists(pool, 'news_articles', 'linkedin_summary', 'TEXT');
    await addColumnIfNotExists(pool, 'news_articles', 'image_position', "VARCHAR(20) DEFAULT '50,50'");
    await addColumnIfNotExists(pool, 'news_articles', 'image_zoom', 'INTEGER DEFAULT 100');
    await addColumnIfNotExists(pool, 'professionals', 'specializations', 'TEXT[]');
    await addColumnIfNotExists(pool, 'professionals', 'role', "VARCHAR(50) DEFAULT 'Associate'");
    await addColumnIfNotExists(pool, 'professionals', 'pec', 'VARCHAR(255)');
    await addColumnIfNotExists(pool, 'users', 'hashed_password', 'VARCHAR');
    await addColumnIfNotExists(pool, 'users', 'role', "VARCHAR(20) NOT NULL DEFAULT 'partner'");
    await addColumnIfNotExists(pool, 'users', 'two_factor_secret', 'VARCHAR(255)');
    await addColumnIfNotExists(pool, 'users', 'two_factor_enabled', "TEXT DEFAULT 'false'");
    await addColumnIfNotExists(pool, 'contact_messages', 'target_email', "VARCHAR(255) DEFAULT 'info@legalit.it'");
    await addColumnIfNotExists(pool, 'news_categories', 'name_en', 'VARCHAR(100)');
    await addColumnIfNotExists(pool, 'professionals', 'image_position', "VARCHAR(20) DEFAULT 'center'");
    await addColumnIfNotExists(pool, 'professionals', 'image_zoom', "INTEGER DEFAULT 100");
    await addColumnIfNotExists(pool, 'news_articles', 'linked_professional_ids', 'TEXT[]');

    console.log("Database schema verified and up to date");
  } catch (err) {
    console.error("FATAL: Error ensuring database schema:", err);
    throw err;
  } finally {
    await pool.end();
  }
}

async function addUniqueConstraintIfNotExists(pool: Pool, table: string, column: string, constraintName: string) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = $1 AND constraint_name = $2`,
    [table, constraintName]
  );
  if (result.rows.length === 0) {
    try {
      await pool.query(`ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} UNIQUE (${column})`);
      console.log(`Added unique constraint ${constraintName} on ${table}.${column}`);
    } catch (err: any) {
      if (err.code === '23505') {
        console.warn(`Cannot add unique constraint ${constraintName}: duplicate values exist in ${table}.${column}`);
      } else {
        throw err;
      }
    }
  }
}

async function addColumnIfNotExists(pool: Pool, table: string, column: string, definition: string) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column]
  );
  if (result.rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`Added column ${column} to ${table}`);
  }
}
