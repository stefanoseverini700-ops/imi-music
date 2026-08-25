/**
 * Seed di sviluppo: crea il tenant di default e un utente Admin.
 * Eseguito con `pnpm --filter @imi/db seed` (o `prisma migrate reset`).
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@imimusic.local';
// Se la password non è impostata si usa quella di sviluppo, MA solo alla
// creazione: un admin già esistente non viene mai reimpostato senza che
// SEED_ADMIN_PASSWORD sia esplicita. Così il seed può girare a ogni deploy
// senza riportare l'account a una password nota.
const PASSWORD_ESPLICITA = process.env.SEED_ADMIN_PASSWORD;
const ADMIN_PASSWORD = PASSWORD_ESPLICITA ?? 'admin1234';

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
  const adminEsistente = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
    select: { id: true },
  });

  if (!adminEsistente) {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        nome: 'Admin',
        email: ADMIN_EMAIL,
        ruolo: Role.ADMIN,
        passwordHash,
      },
    });
    if (!PASSWORD_ESPLICITA && process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️  Admin creato con la password di sviluppo: imposta SEED_ADMIN_PASSWORD e cambiala subito.',
      );
    }
  } else if (PASSWORD_ESPLICITA) {
    // Reimposta la password solo se richiesto esplicitamente.
    await prisma.user.update({ where: { id: adminEsistente.id }, data: { passwordHash } });
    console.log('🔑 Password admin reimpostata da SEED_ADMIN_PASSWORD.');
  }

  // Dipartimenti di default per il ticketing e le cartelle condivise (Sprint 5).
  const DIPARTIMENTI = ['Produzione', 'Grafica', 'Video', 'Foto', 'SMM', 'Amministrazione'];
  for (const nome of DIPARTIMENTI) {
    const esiste = await prisma.department.findFirst({ where: { tenantId: tenant.id, nome } });
    if (!esiste) {
      await prisma.department.create({ data: { tenantId: tenant.id, nome } });
    }
  }

  const admin = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: ADMIN_EMAIL } },
  });

  console.log(`✅ Seed completato — tenant "${tenant.nome}" (${tenant.id})`);
  console.log(`   Admin: ${ADMIN_EMAIL}${PASSWORD_ESPLICITA ? '' : ` / ${ADMIN_PASSWORD}`}`);

  // Dati demo (solo con SEED_DEMO=true), idempotenti per sezione: ogni blocco
  // (artisti, lead, vendite) viene inserito solo se manca — così un seed
  // interrotto a metà si completa rieseguendo il comando.
  if (process.env.SEED_DEMO === 'true') {
    await seedDemo(tenant.id, admin?.id ?? null);
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
  const artisti = await prisma.artist.findMany({ where: { tenantId } });
  if (artisti.length === 0) {
    for (const a of artistiData) {
      artisti.push(await prisma.artist.create({ data: { tenantId, ...a } }));
    }
    console.log(`✨ Demo: ${artisti.length} artisti inseriti.`);
  } else {
    console.log(`ℹ️  Demo: ${artisti.length} artisti già presenti, salto.`);
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
  const leadEsistenti = await prisma.lead.count({ where: { tenantId } });
  if (leadEsistenti === 0) {
    for (const l of leadData) {
      await prisma.lead.create({ data: { tenantId, assegnatoA: venditoreId, ...l } });
    }
    console.log(`✨ Demo: ${leadData.length} lead inseriti.`);
  } else {
    console.log(`ℹ️  Demo: ${leadEsistenti} lead già presenti, salto.`);
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
  const venditeEsistenti = await prisma.sale.count({ where: { tenantId } });
  if (venditeEsistenti === 0) {
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
    console.log(`✨ Demo: ${venditeData.length} vendite inserite.`);
  } else {
    console.log(`ℹ️  Demo: ${venditeEsistenti} vendite già presenti, salto.`);
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
