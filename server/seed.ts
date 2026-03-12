/**
 * SECURITY MODEL — Admin user seeding
 *
 * There is exactly ONE superadmin: ricca.sirtori@gmail.com
 *   - Created on first run if not present; never recreated or downgraded afterwards.
 *   - The "superadmin" role CANNOT be assigned via the UI or any API endpoint.
 *   - To change the superadmin account, edit this file and redeploy.
 *
 * Other privileged users have role "admin":
 *   - Managed via the admin panel (POST /api/admin/update-role), superadmin only.
 *   - Promotable/demotable between "partner" and "admin" from the UI.
 *
 * The seed NEVER modifies the role of an existing user — it only creates missing
 * users and resets their password if it no longer matches.
 */
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "./db";
import { users, professionals } from "@shared/schema";
import { eq, count } from "drizzle-orm";
import { syncDevDataToCurrentDb, exportDbToDevData } from "./syncData";

const BCRYPT_ROUNDS = 12;

interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

function getSeedUsers(): SeedUser[] {
  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Seed] WARNING: SEED_USER_PASSWORD not set in production — skipping user seed.");
      return [];
    }
    throw new Error("[Seed] SEED_USER_PASSWORD environment variable is required");
  }
  return [
    {
      email: "admin@legalit.it",
      firstName: "Admin",
      lastName: "Legalit",
      role: "admin",
      password,
    },
    {
      // The one and only superadmin — do not add others here.
      email: "ricca.sirtori@gmail.com",
      firstName: "Riccardo",
      lastName: "Sirtori",
      role: "superadmin",
      password,
    },
  ];
}

export async function seedAdminUser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    try {
      console.log("[Seed] Production: syncing data from dev_data.json...");
      const result = await syncDevDataToCurrentDb();
      console.log("[Seed] Full data sync result:", JSON.stringify(result));
      return;
    } catch (error) {
      console.error("[Seed] Error during production data sync:", error);
    }
  }

  // Auto-import data from dev_data.json if database is empty (first run)
  try {
    const [{ value: profCount }] = await db.select({ value: count() }).from(professionals);
    if (profCount === 0) {
      console.log("[Seed] Database is empty. Auto-importing data from dev_data.json...");
      const syncResult = await syncDevDataToCurrentDb();
      console.log("[Seed] Auto-import result:", JSON.stringify(syncResult));
      return;
    } else {
      console.log(`[Seed] Database has ${profCount} professionals, skipping auto-import.`);
      exportDbToDevData().catch(e => console.error("[Export] Startup export error:", e));
    }
  } catch (error) {
    console.error("[Seed] Error during auto-import check:", error);
  }

  const seedUsers = getSeedUsers();
  for (const seedUser of seedUsers) {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, seedUser.email));

      if (!existing) {
        const hashedPassword = await bcrypt.hash(seedUser.password, BCRYPT_ROUNDS);
        await db.insert(users).values({
          id: crypto.randomUUID(),
          email: seedUser.email,
          firstName: seedUser.firstName,
          lastName: seedUser.lastName,
          hashedPassword,
          role: seedUser.role,
        });
        console.log(`[Seed] User created: ${seedUser.email} (${seedUser.role})`);
      } else {
        // Never update the role of an existing user — roles are managed via the
        // admin panel only. This prevents accidental promotions or demotions on
        // server restart.
        const updates: Record<string, string> = {};
        const passwordValid = existing.hashedPassword
          ? await bcrypt.compare(seedUser.password, existing.hashedPassword)
          : false;
        if (!passwordValid) {
          const hashedPassword = await bcrypt.hash(seedUser.password, BCRYPT_ROUNDS);
          updates.hashedPassword = hashedPassword;
          console.log(`[Seed] Password reset for: ${seedUser.email}`);
        }
        if (Object.keys(updates).length > 0) {
          await db.update(users).set(updates).where(eq(users.email, seedUser.email));
          console.log(`[Seed] User updated: ${seedUser.email}`);
        }
      }
    } catch (error) {
      console.error(`[Seed] Error seeding user ${seedUser.email}:`, error);
    }
  }
}
