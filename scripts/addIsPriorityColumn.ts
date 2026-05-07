import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "../app/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    const line = fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("DATABASE_URL="));

    if (line) {
      return line
        .slice("DATABASE_URL=".length)
        .trim()
        .replace(/^"|"$/g, "");
    }
  }

  throw new Error("DATABASE_URL is not set");
}

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: getDatabaseUrl(),
  });

  return new PrismaClient({ adapter } as ConstructorParameters<
    typeof PrismaClient
  >[0]);
}

async function main() {
  const prisma = createPrismaClient();

  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "uaa_submissions" ADD COLUMN IF NOT EXISTS "isPriority" BOOLEAN NOT NULL DEFAULT false',
    );

    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name::text AS column_name
      FROM information_schema.columns
      WHERE table_name = 'uaa_submissions'
        AND column_name = 'isPriority'
    `;

    if (columns.length === 0) {
      throw new Error("isPriority column was not found after migration");
    }

    console.log(
      'Migration complete: column "isPriority" exists on table "uaa_submissions".',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to add isPriority column:", error);
  process.exitCode = 1;
});
