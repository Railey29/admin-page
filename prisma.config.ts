import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    const line = fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("DATABASE_URL="));
    if (line) return line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");
  }
  return "";
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: getDatabaseUrl(),
  },
});
