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

  const admin = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
  });

  console.log(`✅ Seed completato — tenant "${tenant.nome}" (${tenant.id})`);
  console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  // Dati demo (solo con SEED_DEMO=true), idempotenti: saltati se ci sono già artisti.
  if (process.env.SEED_DEMO === 'true') {
    const esistenti = await prisma.artist.count({ where: { tenantId: tenant.id } });
    if (esistenti > 0) {
      console.log('ℹ️  Dati demo già presenti, salto.');
    } else {
      await seedDemo(tenant.id, admin?.id ?? null);
      console.log('✨ Dati demo inseriti (artisti, lead, vendite).');
    }
  }
}

async function seedDemo(tenantId: string, venditoreId: string | null) {
  const artistiData = [
    { nome: 'Luna Nera', citta: 'Milano', genereMusicale: 'Indie Pop', piano: 'PRO' as const },
    { nome: 'Marco Sax', citta: 'Roma', genereMusicale: 'Jazz', piano: 'PREMIUM' as const },
    { nome: 'DJ Ares', citta: 'Napoli', genereMusicale: 'Elettronica', piano: 'BASE' as const },
    {
      nome: 'Cora & i Fari',
      citta: 'Bologna',
      genereMusicale: 'Cantautorato',
      piano: 'PRO' as const,
    },
  ];
  const artisti = [];
  for (const a of artistiData) {
    artisti.push(await prisma.artist.create({ data: { tenantId, ...a } }));
  }

  const leadData = [
    { nome: 'Giulia Fontana', fonte: 'Instagram', stato: 'NUOVO' as const, valoreStimato: 1500 },
    { nome: 'The Waves', fonte: 'Referral', stato: 'NUOVO' as const, valoreStimato: 3200 },
    { nome: 'Ketama Live', fonte: 'TikTok', stato: 'QUALIFICATO' as const, valoreStimato: 2400 },
    { nome: 'Sara Blu', fonte: 'Sito web', stato: 'IN_TRATTATIVA' as const, valoreStimato: 5000 },
    {
      nome: 'Neon District',
      fonte: 'Evento',
      stato: 'IN_TRATTATIVA' as const,
      valoreStimato: 4100,
    },
    { nome: 'Rialto Trio', fonte: 'Passaparola', stato: 'VINTO' as const, valoreStimato: 6000 },
    { nome: 'Echo Valley', fonte: 'Instagram', stato: 'PERSO' as const, valoreStimato: 900 },
  ];
  for (const l of leadData) {
    await prisma.lead.create({ data: { tenantId, assegnatoA: venditoreId, ...l } });
  }

  const now = new Date();
  const mkDate = (monthsAgo: number, day: number) =>
    new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
  const venditeData = [
    { importo: 1200, statoPagamento: 'PAGATO' as const, data: mkDate(4, 8) },
    { importo: 2500, statoPagamento: 'PAGATO' as const, data: mkDate(3, 12) },
    { importo: 1800, statoPagamento: 'PAGATO' as const, data: mkDate(2, 5) },
    { importo: 3200, statoPagamento: 'PARZIALE' as const, data: mkDate(1, 18) },
    { importo: 2100, statoPagamento: 'PAGATO' as const, data: mkDate(0, 3) },
    { importo: 4600, statoPagamento: 'PAGATO' as const, data: mkDate(0, 14) },
    { importo: 1500, statoPagamento: 'IN_ATTESA' as const, data: now },
  ];
  for (let i = 0; i < venditeData.length; i++) {
    const v = venditeData[i]!;
    await prisma.sale.create({
      data: {
        tenantId,
        artistId: artisti[i % artisti.length]!.id,
        venditoreId,
        importo: v.importo,
        statoPagamento: v.statoPagamento,
        data: v.data,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
