# CLAUDE.md

Guida per assistenti AI (e sviluppatori) che lavorano su questo repository.

## Cos'è

**Gestionale IMI Music** — CRM/ERP ibrido per un'agenzia musicale. Due macro-aree,
**Sales** (acquisizione artisti) e **Delivery** (erogazione servizi), più
**Ticketing** interno e **Booking** live, con **RBAC a isolamento rigido**.
Tutto il progetto (codice, commenti, UI) è in **italiano** — mantieni questa
convenzione.

Il documento di architettura completo è **`ARCHITETTURA.md`** nella root: è il
riferimento permanente per stack, RBAC, schema ER e roadmap. Consultalo prima di
decisioni di design; se cambi il modello dati, tienilo allineato.

## Stato del progetto

**Fase 0 / Sprint 0 completata** (scaffold) + **Sprint 1 in corso**.

Implementato:

- **Auth** (`apps/api/src/auth`): login/refresh JWT (access + refresh), hashing
  password con `bcryptjs`, `JwtStrategy` che popola `request.user`. Endpoint:
  `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`.
- **Gestione utenti** (`apps/api/src/users`): CRUD base, solo Admin, isolato per
  tenant. Endpoint sotto `/api/users`.
- **Guard globali**: `JwtAuthGuard` (autenticazione) → `RolesGuard` (RBAC).
- **Seed**: crea tenant di default + admin (`admin@imimusic.local` / `admin1234`,
  override con `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

I moduli `sales`, `delivery`, `ticketing`, `booking` sono ancora **stub** con un
commento che indica lo sprint di riferimento. Vedi la roadmap in `ARCHITETTURA.md §6`.

## Architettura del monorepo

Monorepo **pnpm workspaces + Turborepo**. "Monolite modulare": confini di dominio
netti in un'unica codebase, scomponibile in servizi solo se un modulo lo
giustifica.

| Path              | Package       | Contenuto                                                                                                                                               |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | `@imi/web`    | Next.js (App Router) + TS + Tailwind. TanStack Query per i dati server, Zustand per lo stato locale.                                                    |
| `apps/api`        | `@imi/api`    | NestJS. Un modulo per dominio: `auth`, `sales`, `delivery`, `ticketing`, `booking`. `PrismaModule` globale, `RolesGuard` globale.                       |
| `packages/db`     | `@imi/db`     | Prisma: `prisma/schema.prisma` (v1, tradotto dall'ER), client Prisma generato (`@prisma/client`), `seed.ts`. Buildato a `dist/`.                        |
| `packages/shared` | `@imi/shared` | Enum di dominio (`enums.ts`) e contratti RBAC (`rbac.ts`: `Role`, `ModuleKey`, `can()`). Unica fonte di verità per ruoli/stati, usata da API **e** Web. |
| `packages/config` | `@imi/config` | Preset `tsconfig` condivisi (nestjs/nextjs).                                                                                                            |

## Convenzioni chiave

- **RBAC a due livelli** (cfr. `ARCHITETTURA.md §3`): livello 1 = ruolo macro
  (`Role` in `@imi/shared`, applicato dal `RolesGuard` a livello di route);
  livello 2 = permessi di modulo (`can(role, module, action)` in `@imi/shared`,
  da applicare nei servizi per righe/colonne). Non duplicare la logica ruoli:
  importa sempre da `@imi/shared`.
- **Multi-tenant**: le tabelle principali hanno `tenantId` (FK a `Tenant`). Ogni
  nuova entità di primo livello deve avere `tenantId`; le tabelle figlie ereditano
  il tenant dal genitore. Ogni query deve filtrare per tenant.
- **Enum**: definiti una sola volta. Gli enum Prisma (in `schema.prisma`) e gli
  enum TS (in `@imi/shared/enums.ts`) devono restare **allineati per nome**.
- **File polimorfici**: `FileAsset` usa `ownerType`/`ownerId` (nessuna FK rigida)
  per agganciarsi ad artist/task/ticket/release — un unico sistema di upload.
- **Moduli**: i package interni (`@imi/shared`, `@imi/db`) e l'API NestJS sono
  **CommonJS**, buildati a `dist/` con `tsc`; così l'API compilata può fare
  `require()` dei package del workspace a runtime. Negli import relativi TS usa
  comunque l'estensione `.js`. Il web (Next.js) importa i package già buildati.
  Turbo esegue `^build` prima di `dev`/`typecheck`, quindi i `dist` sono pronti.
- **Lingua**: identificatori di dominio, enum, messaggi ed errori in italiano.

## Comandi

```bash
pnpm install
cp .env.example .env
pnpm docker:up                 # Postgres+PostGIS + Redis
pnpm db:generate               # genera il client Prisma (necessario prima di build/typecheck)
pnpm db:migrate                # prisma migrate dev
pnpm --filter @imi/db seed     # tenant di default + admin
pnpm dev                       # web :3000 + api :4000
pnpm lint && pnpm typecheck    # controlli
```

- **Prima di `build`/`typecheck` serve il client Prisma generato** (`pnpm db:generate`),
  altrimenti `@imi/db` non espone i tipi.
- CI (`.github/workflows/ci.yml`): format check → lint → typecheck → build.

## Quando aggiungi codice

- Un nuovo dominio backend = un modulo NestJS in `apps/api/src/<dominio>/`,
  registrato in `app.module.ts`.
- Nuove entità → aggiorna `schema.prisma` (con `tenantId`), rigenera il client,
  crea una migrazione, e aggiungi gli enum corrispondenti in `@imi/shared` se
  servono al frontend.
- Route protette: sono protette per default dal `RolesGuard` globale; usa
  `@Public()` per quelle aperte e `@Roles(...)` per limitare i ruoli macro.
- Non committare `.env` né le cartelle `dist/` / `node_modules/` (già in `.gitignore`).
