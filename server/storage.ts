import {
  users,
  newsArticles,
  partnerInvites,
  professionals,
  newsCategories,
  newsletterSubscribers,
  contactMessages,
  siteSettings,
  auditLogs,
  passwordResetTokens,
  emailLoginCodes,
  translations,
  chatConversations,
  type User,
  type UpsertUser,
  type NewsArticle,
  type InsertNewsArticle,
  type PartnerInvite,
  type InsertPartnerInvite,
  type Professional,
  type InsertProfessional,
  type NewsCategory,
  type InsertNewsCategory,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type ContactMessage,
  type InsertContactMessage,
  type SiteSetting,
  type AuditLog,
  type InsertAuditLog,
  type PasswordResetToken,
  type EmailLoginCode,
  type Translation,
  type ChatConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gt, gte, isNull, isNotNull, ne } from "drizzle-orm";
import crypto from "crypto";
import { slugifyName } from "@shared/slugify";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Partner invite operations
  createInvite(invite: InsertPartnerInvite): Promise<PartnerInvite>;
  getInviteByTokenHash(tokenHash: string): Promise<PartnerInvite | undefined>;
  getInviteByEmail(email: string): Promise<PartnerInvite | undefined>;
  markInviteUsed(id: number): Promise<void>;
  getAllInvites(): Promise<PartnerInvite[]>;
  deleteInvite(id: number): Promise<boolean>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getRecentFailedAttempts(email: string, withinMinutes: number): Promise<number>;
  
  // News article operations
  getAllNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticle(id: number): Promise<NewsArticle | undefined>;
  getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: number): Promise<boolean>;
  
  // Professional operations
  getAllProfessionals(): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  getProfessionalBySlug(slug: string): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, professional: Partial<InsertProfessional>): Promise<Professional | undefined>;
  deleteProfessional(id: number): Promise<boolean>;
  
  // News category operations
  getAllCategories(): Promise<NewsCategory[]>;
  getCategoriesByType(type: string): Promise<NewsCategory[]>;
  getCategory(id: number): Promise<NewsCategory | undefined>;
  createCategory(category: InsertNewsCategory): Promise<NewsCategory>;
  updateCategory(id: number, category: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Newsletter subscriber operations
  getAllSubscribers(): Promise<NewsletterSubscriber[]>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  createSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  unsubscribeByToken(token: string): Promise<boolean>;
  
  // Contact message operations
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageRead(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Password reset operations
  createPasswordResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetUsed(id: number): Promise<void>;
  
  // Email login code operations
  createEmailLoginCode(email: string, codeHash: string, expiresAt: Date): Promise<EmailLoginCode>;
  getEmailLoginCodeByHash(codeHash: string, email: string): Promise<EmailLoginCode | undefined>;
  markEmailLoginCodeUsed(id: number): Promise<void>;
  
  // Site settings operations
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;

  // Translation operations
  getAllTranslations(): Promise<Translation[]>;
  getAllTranslationsDetailed(): Promise<Translation[]>;
  getTranslationsByKeys(keys: string[], lang: string): Promise<Record<string, string>>;
  upsertTranslation(key: string, lang: string, value: string): Promise<void>;
  updateTranslation(id: number, value: string): Promise<void>;
  deleteTranslation(id: number): Promise<void>;

  // Chat conversation operations
  saveConversationMessage(sessionId: string, ipAddress: string, userAgent: string, userMessage: string, modelReply: string): Promise<void>;
  getConversations(): Promise<ChatConversation[]>;
  getConversation(id: number): Promise<ChatConversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result || [];
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Partner invite operations
  async createInvite(invite: InsertPartnerInvite): Promise<PartnerInvite> {
    const [newInvite] = await db.insert(partnerInvites).values(invite).returning();
    return newInvite;
  }

  async getInviteByTokenHash(tokenHash: string): Promise<PartnerInvite | undefined> {
    const [invite] = await db
      .select()
      .from(partnerInvites)
      .where(
        and(
          eq(partnerInvites.tokenHash, tokenHash),
          gt(partnerInvites.expiresAt, new Date()),
          isNull(partnerInvites.usedAt)
        )
      );
    return invite;
  }

  async getInviteByEmail(email: string): Promise<PartnerInvite | undefined> {
    const [invite] = await db
      .select()
      .from(partnerInvites)
      .where(eq(partnerInvites.email, email));
    return invite;
  }

  async markInviteUsed(id: number): Promise<void> {
    await db
      .update(partnerInvites)
      .set({ usedAt: new Date() })
      .where(eq(partnerInvites.id, id));
  }

  async getAllInvites(): Promise<PartnerInvite[]> {
    await this.deleteUsedInvites();
    const result = await db.select().from(partnerInvites).where(isNull(partnerInvites.usedAt)).orderBy(desc(partnerInvites.createdAt));
    return result || [];
  }

  async deleteUsedInvites(): Promise<number> {
    const result = await db.delete(partnerInvites).where(isNotNull(partnerInvites.usedAt));
    return result.rowCount ?? 0;
  }

  async deleteInvite(id: number): Promise<boolean> {
    const result = await db.delete(partnerInvites).where(eq(partnerInvites.id, id)).returning();
    return result.length > 0;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [entry] = await db.insert(auditLogs).values(log).returning();
    return entry;
  }

  async getRecentFailedAttempts(email: string, withinMinutes: number): Promise<number> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    const results = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.targetEmail, email),
          eq(auditLogs.success, "false"),
          gte(auditLogs.createdAt, since)
        )
      );
    return results.length;
  }

  // News article operations
  async getAllNewsArticles(): Promise<NewsArticle[]> {
    const result = await db.select().from(newsArticles).orderBy(desc(newsArticles.createdAt));
    return result || [];
  }

  async getNewsArticle(id: number): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    return article;
  }

  async getNewsArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
    const [article] = await db.select().from(newsArticles).where(eq(newsArticles.slug, slug));
    return article;
  }

  async ensureUniqueArticleSlug(base: string, excludeId?: number): Promise<string> {
    const all = await db.select({ slug: newsArticles.slug, id: newsArticles.id }).from(newsArticles);
    const taken = new Set(
      all
        .filter(r => r.slug && (excludeId === undefined || r.id !== excludeId))
        .map(r => r.slug as string),
    );
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const requested = article.slug?.trim();
    let base = requested ? slugifyName(requested) : slugifyName(article.title);
    if (!base) base = slugifyName(article.title) || `articolo-${Date.now()}`;
    const slug = await this.ensureUniqueArticleSlug(base);
    const [newArticle] = await db.insert(newsArticles).values({ ...article, slug }).returning();
    return newArticle;
  }

  async updateNewsArticle(id: number, article: Partial<InsertNewsArticle>): Promise<NewsArticle | undefined> {
    const patch: Partial<InsertNewsArticle> = { ...article };
    if (patch.slug) {
      patch.slug = await this.ensureUniqueArticleSlug(slugifyName(patch.slug), id);
    } else if (patch.title) {
      // Title changed but slug not explicitly provided: keep existing slug
      // stable to preserve external links. Slug only changes when admin
      // sets it explicitly.
      delete patch.slug;
    }
    const [updated] = await db
      .update(newsArticles)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(newsArticles.id, id))
      .returning();
    return updated;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    const result = await db.delete(newsArticles).where(eq(newsArticles.id, id)).returning();
    return result.length > 0;
  }

  // Professional operations
  async getAllProfessionals(): Promise<Professional[]> {
    const result = await db
      .select()
      .from(professionals)
      .orderBy(asc(professionals.orderIndex), asc(professionals.createdAt));
    return result || [];
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    return professional;
  }

  async getProfessionalBySlug(slug: string): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.slug, slug));
    return professional;
  }

  async ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
    const all = await db.select({ slug: professionals.slug, id: professionals.id }).from(professionals);
    const taken = new Set(
      all
        .filter(r => r.slug && (excludeId === undefined || r.id !== excludeId))
        .map(r => r.slug as string),
    );
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    // Always normalize the slug — whether the caller provided one or we derive
    // it from the name — so that DB stores only safe, lowercase, ASCII slugs.
    const requested = professional.slug?.trim();
    let base = requested ? slugifyName(requested) : slugifyName(professional.name);
    if (!base) base = slugifyName(professional.name) || `prof-${Date.now()}`;
    const slug = await this.ensureUniqueSlug(base);
    const [newProfessional] = await db
      .insert(professionals)
      .values({ ...professional, slug })
      .returning();
    return newProfessional;
  }

  async updateProfessional(id: number, professional: Partial<InsertProfessional>): Promise<Professional | undefined> {
    const patch: Partial<InsertProfessional> = { ...professional };
    if (patch.name && !patch.slug) {
      const base = slugifyName(patch.name);
      patch.slug = await this.ensureUniqueSlug(base, id);
    } else if (patch.slug) {
      patch.slug = await this.ensureUniqueSlug(slugifyName(patch.slug), id);
    }
    const [updated] = await db
      .update(professionals)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning();
    return updated;
  }

  async deleteProfessional(id: number): Promise<boolean> {
    const result = await db.delete(professionals).where(eq(professionals.id, id)).returning();
    return result.length > 0;
  }

  // News category operations
  async getAllCategories(): Promise<NewsCategory[]> {
    const result = await db.select().from(newsCategories).orderBy(asc(newsCategories.type), asc(newsCategories.name));
    return result || [];
  }

  async getCategoriesByType(type: string): Promise<NewsCategory[]> {
    const result = await db.select().from(newsCategories).where(eq(newsCategories.type, type)).orderBy(asc(newsCategories.name));
    return result || [];
  }

  async getCategory(id: number): Promise<NewsCategory | undefined> {
    const [category] = await db.select().from(newsCategories).where(eq(newsCategories.id, id));
    return category;
  }

  async createCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const [newCategory] = await db.insert(newsCategories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    const [updated] = await db
      .update(newsCategories)
      .set(category)
      .where(eq(newsCategories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(newsCategories).where(eq(newsCategories.id, id)).returning();
    return result.length > 0;
  }

  // Newsletter subscriber operations
  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    const result = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
    return result || [];
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email.toLowerCase()));
    return subscriber;
  }

  async createSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const { randomBytes } = await import("crypto");
    const unsubscribeToken = randomBytes(32).toString("hex");
    const [newSubscriber] = await db.insert(newsletterSubscribers).values({
      ...subscriber,
      email: subscriber.email.toLowerCase(),
      unsubscribeToken,
    }).returning();
    return newSubscriber;
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    const result = await db
      .update(newsletterSubscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.unsubscribeToken, token))
      .returning();
    return result.length > 0;
  }

  // Contact message operations
  async getAllContactMessages(): Promise<ContactMessage[]> {
    const result = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    return result || [];
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async markContactMessageRead(id: number): Promise<ContactMessage | undefined> {
    const [updated] = await db
      .update(contactMessages)
      .set({ isRead: "true" })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return result.length > 0;
  }

  // Password reset operations
  async createPasswordResetToken(email: string, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values({
      email,
      tokenHash,
      expiresAt,
    }).returning();
    return token;
  }

  async getPasswordResetByTokenHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
    const [token] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      );
    return token;
  }

  async markPasswordResetUsed(id: number): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  // Email login code operations
  async createEmailLoginCode(email: string, codeHash: string, expiresAt: Date): Promise<EmailLoginCode> {
    const [code] = await db.insert(emailLoginCodes).values({
      email,
      codeHash,
      expiresAt,
    }).returning();
    return code;
  }

  async getEmailLoginCodeByHash(codeHash: string, email: string): Promise<EmailLoginCode | undefined> {
    const [code] = await db
      .select()
      .from(emailLoginCodes)
      .where(
        and(
          eq(emailLoginCodes.codeHash, codeHash),
          eq(emailLoginCodes.email, email),
          gt(emailLoginCodes.expiresAt, new Date()),
          isNull(emailLoginCodes.usedAt)
        )
      );
    return code;
  }

  async markEmailLoginCodeUsed(id: number): Promise<void> {
    await db
      .update(emailLoginCodes)
      .set({ usedAt: new Date() })
      .where(eq(emailLoginCodes.id, id));
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });
  }

  // Translation operations
  async getAllTranslations(): Promise<Translation[]> {
    return await db.select().from(translations).where(eq(translations.lang, "en"));
  }

  async getAllTranslationsDetailed(): Promise<Translation[]> {
    return await db.select().from(translations).orderBy(asc(translations.key));
  }

  async getTranslationsByKeys(keys: string[], lang: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    if (keys.length === 0) return result;
    const allTranslations = await db
      .select()
      .from(translations)
      .where(eq(translations.lang, lang));
    for (const t of allTranslations) {
      if (keys.includes(t.key)) {
        result[t.key] = t.value;
      }
    }
    return result;
  }

  async upsertTranslation(key: string, lang: string, value: string): Promise<void> {
    const existing = await db
      .select()
      .from(translations)
      .where(and(eq(translations.key, key), eq(translations.lang, lang)));
    if (existing.length > 0) {
      await db
        .update(translations)
        .set({ value, updatedAt: new Date() })
        .where(eq(translations.id, existing[0].id));
    } else {
      await db.insert(translations).values({ key, lang, value, updatedAt: new Date() });
    }
  }

  async updateTranslation(id: number, value: string): Promise<void> {
    await db
      .update(translations)
      .set({ value, updatedAt: new Date() })
      .where(eq(translations.id, id));
  }

  async deleteTranslation(id: number): Promise<void> {
    await db.delete(translations).where(eq(translations.id, id));
  }

  async saveConversationMessage(sessionId: string, ipAddress: string, userAgent: string, userMessage: string, modelReply: string): Promise<void> {
    const existing = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId));

    const newMessages = [
      { role: "user", text: userMessage, timestamp: new Date().toISOString() },
      { role: "model", text: modelReply, timestamp: new Date().toISOString() },
    ];

    if (existing.length > 0) {
      const currentMessages = (existing[0].messages as any[]) || [];
      await db
        .update(chatConversations)
        .set({
          messages: [...currentMessages, ...newMessages],
          messageCount: currentMessages.length + newMessages.length,
          updatedAt: new Date(),
        })
        .where(eq(chatConversations.id, existing[0].id));
    } else {
      await db.insert(chatConversations).values({
        sessionId,
        ipAddress,
        userAgent,
        messages: newMessages,
        messageCount: newMessages.length,
        updatedAt: new Date(),
      });
    }
  }

  async getConversations(): Promise<ChatConversation[]> {
    return db
      .select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.updatedAt));
  }

  async getConversation(id: number): Promise<ChatConversation | undefined> {
    const result = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    return result[0];
  }

  async deleteConversation(id: number): Promise<boolean> {
    const result = await db
      .delete(chatConversations)
      .where(eq(chatConversations.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
