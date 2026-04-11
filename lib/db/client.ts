import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { sql } from "drizzle-orm";
import { config } from "@/lib/config";
import * as schema from "./schema";
import { users } from "./schema";
import path from "node:path";

type Db = BetterSQLite3Database<typeof schema>;

let _db: Db | undefined;
let _migrated = false;

export function getDb(urlOverride?: string): Db {
  if (_db) return _db;
  const url = urlOverride ?? config.databaseUrl;
  const file = url.startsWith("file:") ? url.slice(5) : url;
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  _db = drizzle(sqlite, { schema });
  if (!_migrated) {
    const migrationsFolder = path.resolve(process.cwd(), "drizzle");
    migrate(_db, { migrationsFolder });
    const existing = _db.select().from(users).where(sql`id = 1`).all();
    if (existing.length === 0) {
      _db.insert(users).values({ id: 1, email: null, createdAt: new Date() }).run();
    }
    _migrated = true;
  }
  return _db;
}

// Test helper: reset singleton
export function __resetDbForTests(): void {
  _db = undefined;
  _migrated = false;
}
