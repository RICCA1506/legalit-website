import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for partners
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  hashedPassword: varchar("hashed_password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role", { length: 20 }).default("partner").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  twoFactorEnabled: text("two_factor_enabled").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Partner invites table for invite-only registration
export const partnerInvites = pgTable("partner_invites", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerInviteSchema = createInsertSchema(partnerInvites).omit({
  id: true,
  usedAt: true,
  createdAt: true,
});

export type InsertPartnerInvite = z.infer<typeof insertPartnerInviteSchema>;
export type PartnerInvite = typeof partnerInvites.$inferSelect;

// Audit logs table for security monitoring
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  actorId: varchar("actor_id"),
  actorEmail: varchar("actor_email", { length: 255 }),
  targetEmail: varchar("target_email", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  details: text("details"),
  success: text("success").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// News articles table
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  // Slug is nullable in the schema definition so deploy-time diffs produce a
  // non-destructive ADD COLUMN. It is backfilled and promoted to NOT NULL +
  // UNIQUE at runtime in `server/migrate.ts#ensureSchema()`.
  slug: varchar("slug", { length: 255 }).unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  newsType: varchar("news_type", { length: 50 }).default("studio"),
  macroCategory: varchar("macro_category", { length: 100 }),
  microCategory: varchar("micro_category", { length: 100 }),
  linkedProfessionalId: varchar("linked_professional_id", { length: 50 }),
  linkedProfessionalIds: text("linked_professional_ids").array(),
  linkedPracticeArea: varchar("linked_practice_area", { length: 100 }),
  tags: text("tags").array(),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  linkedinSummary: text("linkedin_summary"),
  imageUrl: varchar("image_url", { length: 500 }),
  documentUrl: varchar("document_url", { length: 500 }),
  documentName: varchar("document_name", { length: 255 }),
  readTime: varchar("read_time", { length: 20 }),
  imagePosition: varchar("image_position", { length: 20 }).default("50,50"),
  imageZoom: integer("image_zoom").default(100),
  authorId: varchar("author_id").references(() => users.id),
  authorName: varchar("author_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News categories table for custom categories
export const newsCategories = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("name_en", { length: 100 }),
  type: varchar("type", { length: 20 }).notNull(),
  parentCategory: varchar("parent_category", { length: 100 }),
  isDefault: text("is_default").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsCategorySchema = createInsertSchema(newsCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsCategory = z.infer<typeof insertNewsCategorySchema>;
export type NewsCategory = typeof newsCategories.$inferSelect;

export const insertNewsArticleSchema = createInsertSchema(newsArticles)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  // Slug is auto-generated server-side from `title` when omitted by clients.
  // When provided it must be a valid lowercase ascii slug; uniqueness is
  // enforced at the storage layer.
  .extend({
    slug: z
      .string()
      .min(1, "Lo slug non può essere vuoto")
      .regex(
        /^[a-z0-9-]+$/,
        "Lo slug può contenere solo lettere minuscole, numeri e trattini",
      )
      .optional(),
  });

export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;

// Professionals table
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  // Schema-level definition is intentionally nullable so the deploy-time
  // diff produces a non-destructive `ADD COLUMN`. The column is promoted to
  // NOT NULL at runtime by `server/migrate.ts#ensureSchema()` after the
  // backfill step, which is idempotent and safe to re-run.
  slug: varchar("slug", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).default("Associate"),
  specializations: text("specializations").array(),
  office: varchar("office", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  pec: varchar("pec", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  fullBio: text("full_bio"),
  education: text("education").array(),
  languages: text("languages").array(),
  imageUrl: varchar("image_url", { length: 500 }),
  imagePosition: varchar("image_position", { length: 20 }).default("center"),
  imageZoom: integer("image_zoom").default(100),
  orderIndex: serial("order_index"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProfessionalSchema = createInsertSchema(professionals)
  .omit({
    id: true,
    orderIndex: true,
    createdAt: true,
    updatedAt: true,
  })
  // Slug is auto-generated server-side from `name` when omitted by clients
  // (admin form, scripts, tests). When provided it must still be a valid
  // non-empty string — actual uniqueness is enforced at the storage layer.
  .extend({
    slug: z
      .string()
      .min(1, "Lo slug non può essere vuoto")
      .regex(
        /^[a-z0-9-]+$/,
        "Lo slug può contenere solo lettere minuscole, numeri e trattini",
      )
      .optional(),
  });

export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionals.$inferSelect;

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  source: varchar("source", { length: 50 }).default("website"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
  unsubscribedAt: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 100 }).notNull(),
  message: text("message").notNull(),
  targetEmail: varchar("target_email", { length: 255 }).default("info@legalit.it"),
  isRead: text("is_read").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Email login codes table
export const emailLoginCodes = pgTable("email_login_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type EmailLoginCode = typeof emailLoginCodes.$inferSelect;

// Site settings table for dynamic configuration
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

// Translations table for admin-managed i18n
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  lang: varchar("lang", { length: 10 }).notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  updatedAt: true,
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Chat conversations table for admin review
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  messages: jsonb("messages").notNull().default([]),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

// Password complexity requirements
export const passwordSchema = z.string()
  .min(12, "La password deve avere almeno 12 caratteri")
  .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
  .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
  .regex(/[0-9]/, "La password deve contenere almeno un numero")
  .regex(/[^A-Za-z0-9]/, "La password deve contenere almeno un simbolo speciale");

// Login schema for validation
export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
  twoFactorCode: z.string().optional(),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Registration schema for validation with strong password
export const registerSchema = z.object({
  email: z.string().email("Email non valida"),
  password: passwordSchema,
  firstName: z.string().min(1, "Nome richiesto"),
  lastName: z.string().min(1, "Cognome richiesto"),
  token: z.string().min(1, "Token di invito richiesto"),
});

export type RegisterCredentials = z.infer<typeof registerSchema>;

// 2FA setup schema
export const twoFactorSetupSchema = z.object({
  secret: z.string(),
  code: z.string().length(6, "Il codice deve essere di 6 cifre"),
});

export type TwoFactorSetup = z.infer<typeof twoFactorSetupSchema>;

// 2FA verify schema
export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, "Il codice deve essere di 6 cifre"),
});

export type TwoFactorVerify = z.infer<typeof twoFactorVerifySchema>;
