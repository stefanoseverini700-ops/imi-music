import Link from 'next/link';
import { getHealth } from '@/lib/api';

const MODULI = [
  { nome: 'Sales', desc: 'Lead, pipeline, vendite, KPI venditore', sprint: 'Sprint 2–3' },
  { nome: 'Delivery', desc: 'Catalogo servizi, Piano di Delivery, task', sprint: 'Sprint 4' },
  { nome: 'Ticketing', desc: 'Ticket interni per dipartimento, area file', sprint: 'Sprint 5' },
  { nome: 'Booking', desc: 'Mappa live PostGIS, venue, eventi', sprint: 'Sprint 9' },
];

export default async function HomePage() {
  const health = await getHealth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Gestionale IMI Music</h1>
      <p className="mt-2 text-white/60">Monolite modulare Next.js + NestJS + PostgreSQL.</p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
        >
          Accedi
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          Cruscotto
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-white/10 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Stato API</h2>
        {health ? (
          <p className="mt-1">
            <span className="text-green-400">● online</span> — database:{' '}
            <span className={health.db === 'up' ? 'text-green-400' : 'text-red-400'}>
              {health.db}
            </span>
          </p>
        ) : (
          <p className="mt-1 text-red-400">● API non raggiungibile (avvia `pnpm dev`)</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Moduli di dominio
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {MODULI.map((m) => (
            <li key={m.nome} className="rounded-lg border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{m.nome}</span>
                <span className="text-xs text-white/40">{m.sprint}</span>
              </div>
              <p className="mt-1 text-sm text-white/60">{m.desc}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
