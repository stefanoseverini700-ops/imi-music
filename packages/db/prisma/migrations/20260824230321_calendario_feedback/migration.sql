-- CreateEnum
CREATE TYPE "AppuntamentoTipo" AS ENUM ('CALL', 'RIUNIONE', 'ASSENZA');

-- CreateTable
CREATE TABLE "appuntamenti" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "titolo" TEXT NOT NULL,
    "inizio" TIMESTAMP(3) NOT NULL,
    "tipo" "AppuntamentoTipo" NOT NULL DEFAULT 'CALL',
    "userId" UUID,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appuntamenti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "autoreId" UUID,
    "testo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appuntamenti_tenantId_idx" ON "appuntamenti"("tenantId");

-- CreateIndex
CREATE INDEX "appuntamenti_inizio_idx" ON "appuntamenti"("inizio");

-- CreateIndex
CREATE INDEX "feedbacks_tenantId_idx" ON "feedbacks"("tenantId");

-- AddForeignKey
ALTER TABLE "appuntamenti" ADD CONSTRAINT "appuntamenti_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appuntamenti" ADD CONSTRAINT "appuntamenti_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_autoreId_fkey" FOREIGN KEY ("autoreId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
