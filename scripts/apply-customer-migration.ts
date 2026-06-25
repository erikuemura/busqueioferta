/**
 * Aplica a migration 2_customer_accounts em statements separados (autocommit),
 * contornando a limitação de ALTER TYPE ADD VALUE em transação no Prisma Postgres.
 * Idempotente (IF NOT EXISTS).
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CUSTOMER'`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "interests" "Category"[]`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastDigestAt" TIMESTAMP(3)`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "wantsEmail" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "wantsWhatsapp" BOOLEAN NOT NULL DEFAULT true`,
];

async function main() {
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("✓", sql.slice(0, 60));
    } catch (e) {
      console.error("✗", sql.slice(0, 60), "→", (e as Error).message);
    }
  }
}

main().finally(() => prisma.$disconnect());
