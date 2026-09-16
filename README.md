# Phaeron NEXUS

Internal command centre for Phaeron — global fleet, ontology, commercial intelligence, and team operations.

## Stack

- Next.js 15 (App Router)
- TypeScript · Tailwind CSS v4
- Drizzle ORM + embedded PGlite (optional Docker Postgres)
- TanStack Query + LivePulse SSE
- uPlot · globe.gl · Sigma · Recharts · Zustand (UI only)

## Develop

```bash
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional real Postgres:

```bash
docker compose up -d
# set DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus
npm run db:seed
npm run dev
```

## LivePulse

The server runs a 1s LivePulse that drifts fleet metrics, cluster util, and the event feed, streamed to the browser via `/api/live/stream` (SSE). Notes and tasks persist to PGlite/Postgres.

## Routes

| Path | View |
|------|------|
| `/` | Global Command (live) |
| `/clients` | Client network |
| `/clients/[id]` | Organisation dossier |
| `/ontology` | Concept graph |
| `/infrastructure` | Fleet health (live) |
| `/revenue` | Commercial intelligence |
| `/team` | Collaboration layer |

## API

| Path | Purpose |
|------|---------|
| `/api/snapshot` | Full world snapshot |
| `/api/live/stream` | SSE live patches |
| `/api/orgs` · `/api/clusters` · `/api/opportunities` | Entity lists |
| `/api/tasks` · `/api/notes` · `/api/activities` | Durable work objects |
