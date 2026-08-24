/**
 * Seed di sviluppo: crea il tenant di default e un utente Admin.
 * Eseguito con `pnpm --filter @imi/db seed` (o `prisma migrate reset`).
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@imimusic.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';

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

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
    update: { passwordHash },
    create: {
      tenantId: tenant.id,
      nome: 'Admin',
      email: ADMIN_EMAIL,
      ruolo: Role.ADMIN,
      passwordHash,
    },
  });

  console.log(`✅ Seed completato — tenant "${tenant.nome}" (${tenant.id})`);
  console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
