import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "./db";
import { users, professionals } from "@shared/schema";
import { eq } from "drizzle-orm";
import { syncDevDataToCurrentDb } from "./syncData";

const BCRYPT_ROUNDS = 12;

interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: "admin@legalit.it",
    firstName: "Admin",
    lastName: "Legalit",
    role: "superadmin",
    password: "LEG2026!",
  },
  {
    email: "ricca.sirtori@gmail.com",
    firstName: "Riccardo",
    lastName: "Sirtori",
    role: "superadmin",
    password: "LEG2026!",
  },
];

export async function seedAdminUser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    try {
      const allProfessionals = await db.select().from(professionals);
      if (allProfessionals.length < 20) {
        console.log(`[Seed] Production has ${allProfessionals.length} professionals (expected 26+). Running full data sync...`);
        const result = await syncDevDataToCurrentDb();
        console.log("[Seed] Full data sync result:", JSON.stringify(result));
        return;
      } else {
        console.log(`[Seed] Production has ${allProfessionals.length} professionals. Data in sync.`);
      }
    } catch (error) {
      console.error("[Seed] Error checking production data, falling back to basic seed:", error);
    }
  }

  for (const seedUser of SEED_USERS) {
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
        const updates: Record<string, string> = {};
        if (existing.role !== seedUser.role) updates.role = seedUser.role;
        const passwordValid = existing.hashedPassword ? await bcrypt.compare(seedUser.password, existing.hashedPassword) : false;
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
