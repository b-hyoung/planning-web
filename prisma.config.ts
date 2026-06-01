import { config as dotenvConfig } from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local for local dev (Next.js convention)
dotenvConfig({ path: path.resolve(process.cwd(), ".env.local") });
// Fallback to .env if .env.local is absent
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
