/**
 * Svuota i dati operativi (artisti, lead, vendite, calendario, bacheca) per
 * ripartire con i dati reali. NON tocca il tenant né gli utenti dello staff.
 *
 * Uso:  pnpm db:pulisci -- --conferma
 * Senza --conferma mostra solo il conteggio di ciò che verrebbe eliminato.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT_ID = process.env.DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';
const conferma = process.argv.includes('--conferma');

async function main() {
  const where = { tenantId: TENANT_ID };
  const [artisti, lead, vendite, appuntamenti, feedbacks] = await Promise.all([
    prisma.artist.count({ where }),
    prisma.lead.count({ where }),
    prisma.sale.count({ where }),
    prisma.appuntamento.count({ where }),
    prisma.feedback.count({ where }),
  ]);

  console.log('Dati presenti nel tenant:');
  console.log(`  artisti: ${artisti}`);
  console.log(`  lead: ${lead}`);
  console.log(`  vendite: ${vendite}`);
  console.log(`  appuntamenti: ${appuntamenti}`);
  console.log(`  feedback: ${feedbacks}`);

  if (!conferma) {
    console.log('\n⚠️  Anteprima: nulla è stato eliminato.');
    console.log('   Per eliminare davvero:  pnpm db:pulisci -- --conferma');
    return;
  }

  // Ordine: prima le tabelle che referenziano le altre.
  await prisma.feedback.deleteMany({ where });
  await prisma.appuntamento.deleteMany({ where });
  await prisma.sale.deleteMany({ where });
  await prisma.lead.deleteMany({ where });
  await prisma.artist.deleteMany({ where });

  console.log('\n🧹 Dati operativi eliminati. Tenant e utenti restano intatti.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
