-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES', 'OPERATORE', 'ARTISTA');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATTIVO', 'SOSPESO', 'DISATTIVATO');

-- CreateEnum
CREATE TYPE "ArtistPlan" AS ENUM ('BASE', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NUOVO', 'QUALIFICATO', 'IN_TRATTATIVA', 'VINTO', 'PERSO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('IN_ATTESA', 'PARZIALE', 'PAGATO', 'RIMBORSATO');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('DISTRIBUZIONE', 'MANAGEMENT', 'ADVERTISING_PROMO', 'PITCH_PR', 'LIVE', 'BRANDING');

-- CreateEnum
CREATE TYPE "DeliveryPlanStatus" AS ENUM ('BOZZA', 'ATTIVO', 'COMPLETATO', 'SOSPESO');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DA_FARE', 'IN_CORSO', 'IN_REVISIONE', 'COMPLETATO');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('BASSA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('GRUPPO', 'INDIVIDUALE');

-- CreateEnum
CREATE TYPE "ConsultationOutcome" AS ENUM ('SVOLTA', 'NO_SHOW', 'RIMANDATA');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('APERTO', 'IN_LAVORAZIONE', 'IN_ATTESA', 'RISOLTO', 'CHIUSO');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('BASSA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "FileOwnerType" AS ENUM ('ARTIST', 'TASK', 'TICKET', 'RELEASE');

-- CreateEnum
CREATE TYPE "FileAssetType" AS ENUM ('MASTER_AUDIO', 'COPERTINA', 'VIDEO', 'GRAFICA', 'DOCUMENTO', 'ALTRO');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PROPOSTO', 'ACCETTATO', 'RIFIUTATO');

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('BOZZA', 'IN_LAVORAZIONE', 'PROGRAMMATA', 'PUBBLICATA');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SCADENZA', 'TASK', 'TICKET', 'SISTEMA');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "ruolo" "Role" NOT NULL,
    "dipartimento" TEXT,
    "stato" "UserStatus" NOT NULL DEFAULT 'ATTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "nome" TEXT NOT NULL,
    "citta" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "genereMusicale" TEXT,
    "piano" "ArtistPlan" NOT NULL DEFAULT 'BASE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "fonte" TEXT,
    "stato" "LeadStatus" NOT NULL DEFAULT 'NUOVO',
    "valoreStimato" DECIMAL(12,2),
    "assegnatoA" UUID,
    "artistId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "leadId" UUID,
    "artistId" UUID NOT NULL,
    "venditoreId" UUID,
    "importo" DECIMAL(12,2) NOT NULL,
    "statoPagamento" "PaymentStatus" NOT NULL DEFAULT 'IN_ATTESA',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "ServiceCategory" NOT NULL,
    "prezzoBase" DECIMAL(12,2) NOT NULL,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" UUID NOT NULL,
    "saleId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "prezzo" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_plans" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "saleId" UUID,
    "stato" "DeliveryPlanStatus" NOT NULL DEFAULT 'BOZZA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_stages" (
    "id" UUID NOT NULL,
    "deliveryPlanId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "percentuale" INTEGER NOT NULL DEFAULT 0,
    "ordine" INTEGER NOT NULL,

    CONSTRAINT "delivery_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "deliveryStageId" UUID,
    "titolo" TEXT NOT NULL,
    "descrizione" TEXT,
    "assegnatoA" UUID,
    "scadenza" TIMESTAMP(3),
    "stato" "TaskStatus" NOT NULL DEFAULT 'DA_FARE',
    "priorita" "TaskPriority" NOT NULL DEFAULT 'MEDIA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalties" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "taskId" UUID,
    "userId" UUID NOT NULL,
    "motivo" TEXT NOT NULL,
    "importo" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journeys" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "faseCorrente" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_phases" (
    "id" UUID NOT NULL,
    "journeyId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ordine" INTEGER NOT NULL,

    CONSTRAINT "journey_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_tasks" (
    "id" UUID NOT NULL,
    "journeyPhaseId" UUID NOT NULL,
    "titolo" TEXT NOT NULL,
    "completato" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "journey_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "staffId" UUID,
    "tipo" "ConsultationType" NOT NULL,
    "esito" "ConsultationOutcome" NOT NULL DEFAULT 'SVOLTA',
    "data" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "departmentId" UUID,
    "artistId" UUID,
    "creatoDa" UUID,
    "assegnatoA" UUID,
    "oggetto" TEXT NOT NULL,
    "stato" "TicketStatus" NOT NULL DEFAULT 'APERTO',
    "priorita" "TicketPriority" NOT NULL DEFAULT 'MEDIA',
    "slaScadenza" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "autoreId" UUID,
    "testo" TEXT NOT NULL,
    "creatoIl" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "ownerType" "FileOwnerType" NOT NULL,
    "ownerId" UUID NOT NULL,
    "departmentId" UUID,
    "tipo" "FileAssetType" NOT NULL DEFAULT 'ALTRO',
    "nomeFile" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "versione" INTEGER NOT NULL DEFAULT 1,
    "caricatoDa" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "citta" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "artistId" UUID,
    "venueId" UUID,
    "data" TIMESTAMP(3) NOT NULL,
    "stato" "EventStatus" NOT NULL DEFAULT 'PROPOSTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "artistId" UUID NOT NULL,
    "titolo" TEXT NOT NULL,
    "dataUscita" TIMESTAMP(3),
    "isrc" TEXT,
    "genere" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "stato" "ReleaseStatus" NOT NULL DEFAULT 'BOZZA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_copies" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "autore" TEXT,
    "compositore" TEXT,
    "editori" TEXT,
    "linkSpotify" TEXT,
    "linkTiktok" TEXT,
    "startTimeTiktok" TEXT,
    "bioTerzaPersona" TEXT,
    "descrizionePitch" TEXT,

    CONSTRAINT "label_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_stats" (
    "id" UUID NOT NULL,
    "releaseId" UUID NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "piattaforma" TEXT NOT NULL,
    "ascolti" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "stream_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tipo" "NotificationType" NOT NULL,
    "testo" TEXT,
    "letto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "artists_userId_key" ON "artists"("userId");

-- CreateIndex
CREATE INDEX "artists_tenantId_idx" ON "artists"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_artistId_key" ON "leads"("artistId");

-- CreateIndex
CREATE INDEX "leads_tenantId_idx" ON "leads"("tenantId");

-- CreateIndex
CREATE INDEX "leads_assegnatoA_idx" ON "leads"("assegnatoA");

-- CreateIndex
CREATE INDEX "sales_tenantId_idx" ON "sales"("tenantId");

-- CreateIndex
CREATE INDEX "sales_artistId_idx" ON "sales"("artistId");

-- CreateIndex
CREATE INDEX "service_catalog_tenantId_idx" ON "service_catalog"("tenantId");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_plans_saleId_key" ON "delivery_plans"("saleId");

-- CreateIndex
CREATE INDEX "delivery_plans_tenantId_idx" ON "delivery_plans"("tenantId");

-- CreateIndex
CREATE INDEX "delivery_plans_artistId_idx" ON "delivery_plans"("artistId");

-- CreateIndex
CREATE INDEX "delivery_stages_deliveryPlanId_idx" ON "delivery_stages"("deliveryPlanId");

-- CreateIndex
CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");

-- CreateIndex
CREATE INDEX "tasks_assegnatoA_idx" ON "tasks"("assegnatoA");

-- CreateIndex
CREATE INDEX "penalties_tenantId_idx" ON "penalties"("tenantId");

-- CreateIndex
CREATE INDEX "penalties_userId_idx" ON "penalties"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "journeys_artistId_key" ON "journeys"("artistId");

-- CreateIndex
CREATE INDEX "journeys_tenantId_idx" ON "journeys"("tenantId");

-- CreateIndex
CREATE INDEX "journey_phases_journeyId_idx" ON "journey_phases"("journeyId");

-- CreateIndex
CREATE INDEX "journey_tasks_journeyPhaseId_idx" ON "journey_tasks"("journeyPhaseId");

-- CreateIndex
CREATE INDEX "consultations_tenantId_idx" ON "consultations"("tenantId");

-- CreateIndex
CREATE INDEX "consultations_artistId_idx" ON "consultations"("artistId");

-- CreateIndex
CREATE INDEX "departments_tenantId_idx" ON "departments"("tenantId");

-- CreateIndex
CREATE INDEX "tickets_tenantId_idx" ON "tickets"("tenantId");

-- CreateIndex
CREATE INDEX "tickets_departmentId_idx" ON "tickets"("departmentId");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "file_assets_tenantId_idx" ON "file_assets"("tenantId");

-- CreateIndex
CREATE INDEX "file_assets_ownerType_ownerId_idx" ON "file_assets"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "venues_tenantId_idx" ON "venues"("tenantId");

-- CreateIndex
CREATE INDEX "events_tenantId_idx" ON "events"("tenantId");

-- CreateIndex
CREATE INDEX "releases_tenantId_idx" ON "releases"("tenantId");

-- CreateIndex
CREATE INDEX "releases_artistId_idx" ON "releases"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "label_copies_releaseId_key" ON "label_copies"("releaseId");

-- CreateIndex
CREATE INDEX "stream_stats_releaseId_idx" ON "stream_stats"("releaseId");

-- CreateIndex
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artists" ADD CONSTRAINT "artists_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artists" ADD CONSTRAINT "artists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assegnatoA_fkey" FOREIGN KEY ("assegnatoA") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_venditoreId_fkey" FOREIGN KEY ("venditoreId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_catalog" ADD CONSTRAINT "service_catalog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_plans" ADD CONSTRAINT "delivery_plans_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_stages" ADD CONSTRAINT "delivery_stages_deliveryPlanId_fkey" FOREIGN KEY ("deliveryPlanId") REFERENCES "delivery_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_stages" ADD CONSTRAINT "delivery_stages_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deliveryStageId_fkey" FOREIGN KEY ("deliveryStageId") REFERENCES "delivery_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assegnatoA_fkey" FOREIGN KEY ("assegnatoA") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_phases" ADD CONSTRAINT "journey_phases_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_tasks" ADD CONSTRAINT "journey_tasks_journeyPhaseId_fkey" FOREIGN KEY ("journeyPhaseId") REFERENCES "journey_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creatoDa_fkey" FOREIGN KEY ("creatoDa") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assegnatoA_fkey" FOREIGN KEY ("assegnatoA") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_caricatoDa_fkey" FOREIGN KEY ("caricatoDa") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_copies" ADD CONSTRAINT "label_copies_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_stats" ADD CONSTRAINT "stream_stats_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
