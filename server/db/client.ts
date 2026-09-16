import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

export type NexusDb =
  | ReturnType<typeof drizzlePglite<typeof schema>>
  | ReturnType<typeof drizzlePostgres<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __nexusDb: NexusDb | undefined;
  // eslint-disable-next-line no-var
  var __nexusDbReady: Promise<NexusDb> | undefined;
  // eslint-disable-next-line no-var
  var __nexusPgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __nexusPglite: PGlite | undefined;
}

export const DDL = `
CREATE TABLE IF NOT EXISTS organisations (
  id text PRIMARY KEY,
  name text NOT NULL,
  industry text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  lat real NOT NULL,
  lng real NOT NULL,
  health text NOT NULL,
  maturity text NOT NULL,
  runtime_version text NOT NULL,
  ontology_version text NOT NULL,
  domain_packs jsonb NOT NULL,
  evaluation_score real NOT NULL,
  uptime real NOT NULL,
  api_calls_24h integer NOT NULL,
  latency_p99 real NOT NULL,
  error_rate real NOT NULL,
  commercial_stage text NOT NULL,
  arr integer NOT NULL,
  account_owner text NOT NULL,
  relationship_score integer NOT NULL,
  last_commercial_contact text NOT NULL,
  open_opportunities integer NOT NULL,
  contacts jsonb NOT NULL,
  deployment jsonb NOT NULL,
  hub_activity real NOT NULL,
  pricing_tier text,
  products jsonb,
  last_meeting jsonb,
  next_meeting jsonb,
  news jsonb,
  mrr integer,
  ytd_revenue integer,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id text PRIMARY KEY,
  client_name text NOT NULL,
  client_id text,
  value integer NOT NULL,
  weighted_value integer NOT NULL,
  stage text NOT NULL,
  geography text NOT NULL,
  region text NOT NULL,
  owner text NOT NULL,
  days_in_stage integer NOT NULL,
  health text NOT NULL,
  next_action text NOT NULL,
  confidence real NOT NULL
);

CREATE TABLE IF NOT EXISTS clusters (
  id text PRIMARY KEY,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id text PRIMARY KEY,
  payload jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  module text NOT NULL,
  client_id text,
  client_name text,
  assignee_id text NOT NULL,
  assignee_name text NOT NULL,
  priority text NOT NULL,
  due_date text NOT NULL,
  status text NOT NULL,
  raised_by text NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id text PRIMARY KEY,
  object_type text NOT NULL,
  object_id text NOT NULL,
  author text NOT NULL,
  body text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id text PRIMARY KEY,
  type text NOT NULL,
  actor_id text,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  timestamp text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  source text NOT NULL,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS relationships (
  id text PRIMARY KEY,
  from_id text NOT NULL,
  to_id text NOT NULL,
  type text NOT NULL,
  weight real,
  label text
);
`;

const DROP_DDL = `
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS clusters CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS organisations CASCADE;
`;

export async function resetSchema(): Promise<void> {
  if (globalThis.__nexusPglite) {
    await globalThis.__nexusPglite.exec(DROP_DDL);
    await globalThis.__nexusPglite.exec(DDL);
    return;
  }
  if (globalThis.__nexusPgClient) {
    await globalThis.__nexusPgClient.unsafe(DROP_DDL);
    await globalThis.__nexusPgClient.unsafe(DDL);
  }
}

async function createPgliteDb(): Promise<NexusDb> {
  const dataDir =
    process.env.PGLITE_DATA_DIR ??
    path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  globalThis.__nexusPglite = client;
  await client.exec(DDL);
  await client
    .exec(
      `ALTER TABLE opportunities ALTER COLUMN confidence TYPE real USING confidence::real;`
    )
    .catch(() => undefined);
  return drizzlePglite({ client, schema });
}

async function createPostgresDb(url: string): Promise<NexusDb> {
  const sql = postgres(url, { max: 5 });
  globalThis.__nexusPgClient = sql;
  await sql.unsafe(DDL);
  await sql
    .unsafe(
      `ALTER TABLE opportunities ALTER COLUMN confidence TYPE real USING confidence::real;`
    )
    .catch(() => undefined);
  return drizzlePostgres(sql, { schema });
}

export async function getDb(): Promise<NexusDb> {
  if (globalThis.__nexusDb) return globalThis.__nexusDb;
  if (!globalThis.__nexusDbReady) {
    globalThis.__nexusDbReady = (async () => {
      const url = process.env.DATABASE_URL;
      const db = url ? await createPostgresDb(url) : await createPgliteDb();
      globalThis.__nexusDb = db;
      return db;
    })();
  }
  return globalThis.__nexusDbReady;
}
