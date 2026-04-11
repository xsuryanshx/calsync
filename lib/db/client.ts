import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import { config } from "@/lib/config";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | undefined;
let _sql: Sql | undefined;

export function getDb(urlOverride?: string): Db {
  if (_db && !urlOverride) return _db;

  const sql = postgres(urlOverride ?? config.databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  const db = drizzle(sql, { schema });

  if (!urlOverride) {
    _sql = sql;
    _db = db;
  }

  return db;
}

export async function closeDb(): Promise<void> {
  if (_sql) {
    await _sql.end({ timeout: 5 });
    _sql = undefined;
    _db = undefined;
  }
}

export function __resetDbForTests(): void {
  _sql = undefined;
  _db = undefined;
}
