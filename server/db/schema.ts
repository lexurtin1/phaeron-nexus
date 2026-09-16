import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const organisations = pgTable("organisations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  health: text("health").notNull(),
  maturity: text("maturity").notNull(),
  runtimeVersion: text("runtime_version").notNull(),
  ontologyVersion: text("ontology_version").notNull(),
  domainPacks: jsonb("domain_packs").$type<string[]>().notNull(),
  evaluationScore: real("evaluation_score").notNull(),
  uptime: real("uptime").notNull(),
  apiCalls24h: integer("api_calls_24h").notNull(),
  latencyP99: real("latency_p99").notNull(),
  errorRate: real("error_rate").notNull(),
  commercialStage: text("commercial_stage").notNull(),
  arr: integer("arr").notNull(),
  accountOwner: text("account_owner").notNull(),
  relationshipScore: integer("relationship_score").notNull(),
  lastCommercialContact: text("last_commercial_contact").notNull(),
  openOpportunities: integer("open_opportunities").notNull(),
  contacts: jsonb("contacts").$type<unknown[]>().notNull(),
  deployment: jsonb("deployment").$type<Record<string, unknown>>().notNull(),
  hubActivity: real("hub_activity").notNull(),
  pricingTier: text("pricing_tier"),
  products: jsonb("products").$type<string[]>(),
  lastMeeting: jsonb("last_meeting"),
  nextMeeting: jsonb("next_meeting"),
  news: jsonb("news"),
  mrr: integer("mrr"),
  ytdRevenue: integer("ytd_revenue"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: text("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientId: text("client_id"),
  value: integer("value").notNull(),
  weightedValue: integer("weighted_value").notNull(),
  stage: text("stage").notNull(),
  geography: text("geography").notNull(),
  region: text("region").notNull(),
  owner: text("owner").notNull(),
  daysInStage: integer("days_in_stage").notNull(),
  health: text("health").notNull(),
  nextAction: text("next_action").notNull(),
  confidence: real("confidence").notNull(),
});

export const clusters = pgTable("clusters", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
});

export const incidents = pgTable("incidents", {
  id: text("id").primaryKey(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  module: text("module").notNull(),
  clientId: text("client_id"),
  clientName: text("client_name"),
  assigneeId: text("assignee_id").notNull(),
  assigneeName: text("assignee_name").notNull(),
  priority: text("priority").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(),
  raisedBy: text("raised_by").notNull(),
});

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  actorId: text("actor_id"),
  subjectType: text("subject_type").notNull(),
  subjectId: text("subject_id").notNull(),
  timestamp: text("timestamp").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  source: text("source").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const relationships = pgTable("relationships", {
  id: text("id").primaryKey(),
  fromId: text("from_id").notNull(),
  toId: text("to_id").notNull(),
  type: text("type").notNull(),
  weight: real("weight"),
  label: text("label"),
});
