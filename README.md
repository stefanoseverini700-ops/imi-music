# Gestionale IMI Music

CRM/ERP ibrido per agenzia musicale — domini **Sales**, **Delivery**, **Ticketing**, **Booking**, con RBAC a isolamento rigido. Monolite modulare in un unico monorepo.

> Il blueprint tecnico completo (stack, RBAC, schema ER, roadmap a sprint) è in [`ARCHITETTURA.md`](./ARCHITETTURA.md).

## Stack

| Area | Tecnologie |
|------|------------|
| Frontend | Next.js (App Router) + TypeScript, Tailwind CSS, TanStack Query, Zustand |
| Backend | NestJS (TypeScript), moduli per dominio, guard RBAC, JWT (Sprint 1) |
| Dati | PostgreSQL + PostGIS, Prisma ORM, Redis (cache/code) |
| Tooling | pnpm workspaces + Turborepo, ESLint + Prettier, GitHub Actions |

## Struttura del monorepo

```
apps/
  web/        # Next.js — portale web + dashboard
  api/        # NestJS — API REST, moduli: auth, sales, delivery, ticketing, booking
packages/
  db/         # Prisma schema + client generato (@imi/db)
  shared/     # enum di dominio + contratti RBAC (@imi/shared)
  config/     # preset tsconfig condivisi (@imi/config)
```

## Requisiti

- Node.js 20+ (`.nvmrc`)
- pnpm 9+
- Docker + Docker Compose (Postgres + Redis locali)

## Avvio in locale

```bash
# 1. Dipendenze
pnpm install

# 2. Variabili d'ambiente
cp .env.example .env

# 3. Servizi (Postgres+PostGIS, Redis)
pnpm docker:up

# 4. Database: genera il client, applica lo schema, seed
pnpm db:generate
pnpm db:migrate        # crea la prima migrazione
pnpm --filter @imi/db seed

# 5. Avvia web (:3000) + api (:4000)
pnpm dev
```

Verifica: `http://localhost:4000/api/health` → `{ "status": "ok", "db": "up" }`, e la home su `http://localhost:3000` mostra lo stato API online.

## Script utili (root)

| Comando | Effetto |
|---------|---------|
| `pnpm dev` | Avvia tutte le app in watch (Turborepo) |
| `pnpm build` | Build di tutto il monorepo |
| `pnpm lint` / `pnpm typecheck` | Lint / type-check su tutti i package |
| `pnpm format` | Prettier write |
| `pnpm db:migrate` | Prisma migrate dev |
| `pnpm db:studio` | Prisma Studio |
| `pnpm docker:up` / `pnpm docker:down` | Avvia/ferma Postgres+Redis |

## Roadmap

Vedi `ARCHITETTURA.md §6`. **Fase 0 (Sprint 0)** — questo scaffold: monorepo, config TS/lint, schema Prisma v1, RBAC skeleton, ambiente locale, CI. Fase 1 (Sprint 1–6) = MVP; Fase 2 (Sprint 7–10+) = automazione & scala.
