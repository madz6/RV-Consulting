import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const dataDir =
  process.env.PSW_DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const globalForDb = globalThis as unknown as {
  pswDb?: ReturnType<typeof createDb>;
};

function createDb() {
  const sqlite = new Database(path.join(dataDir, "psw.db"));
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb.pswDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.pswDb = db;

export * from "./schema";
