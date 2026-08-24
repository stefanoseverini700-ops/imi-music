/**
 * Seed di sviluppo: crea il tenant di default e un utente Admin.
 * Eseguito con `pnpm --filter @imi/db seed` (o `prisma migrate reset`).
 */
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: DEFAULT_TENANT_ID },
    update: {},
    create: {
      id: DEFAULT_TENANT_ID,
      nome: 'IMI Music',
      slug: 'imi-music',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@imimusic.local' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Admin',
      email: 'admin@imimusic.local',
      ruolo: Role.ADMIN,
      // NB: in Fase 1 (Sprint 1, Auth) sostituire con hash reale (argon2/bcrypt).
      passwordHash: null,
    },
  });

  console.log(`✅ Seed completato — tenant "${tenant.nome}" (${tenant.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
