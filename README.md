# Phaeron NEXUS

Internal command centre for Phaeron — global fleet, ontology, commercial intelligence, and team operations.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion, Three.js / globe.gl, Sigma.js, Recharts, Zustand

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | View |
|------|------|
| `/` | Global Command |
| `/clients` | Client network |
| `/clients/[id]` | Client dossier |
| `/ontology` | Concept graph |
| `/infrastructure` | Fleet health |
| `/revenue` | Commercial intelligence |
| `/team` | Collaboration layer |
