'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LeadStatus } from '@imi/shared';
import { authGet, getToken, logout } from '@/lib/api-client';
import type { Artist, IncassiDashboard, Lead } from '@/lib/dto';

const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

const COLONNE: { stato: LeadStatus; label: string }[] = [
  { stato: LeadStatus.NUOVO, label: 'Nuovo' },
  { stato: LeadStatus.QUALIFICATO, label: 'Qualificato' },
  { stato: LeadStatus.IN_TRATTATIVA, label: 'In trattativa' },
  { stato: LeadStatus.VINTO, label: 'Vinto' },
  { stato: LeadStatus.PERSO, label: 'Perso' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [incassi, setIncassi] = useState<IncassiDashboard | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    Promise.all([
      authGet<IncassiDashboard>('/api/sales/dashboard/incassi'),
      authGet<Lead[]>('/api/leads'),
      authGet<Artist[]>('/api/artists'),
    ])
      .then(([i, l, a]) => {
        setIncassi(i);
        setLeads(l);
        setArtists(a);
      })
      .catch((e: Error) => {
        if (e.message === 'unauthorized') router.replace('/login');
        else setError(e.message);
      });
  }, [router]);

  const maxMese = incassi ? Math.max(1, ...incassi.perMese.map((m) => m.totale)) : 1;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cruscotto</h1>
          <p className="text-sm text-white/50">Gestionale IMI Music</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.replace('/login');
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
        >
          Esci
        </button>
      </header>

      {error && <p className="mt-6 text-red-400">Errore: {error}</p>}

      {/* Incassi */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Incassi oggi" value={incassi ? EUR.format(incassi.oggi) : '—'} />
        <StatCard label="Incassi mese" value={incassi ? EUR.format(incassi.mese) : '—'} />
        <StatCard label="Totale" value={incassi ? EUR.format(incassi.totale) : '—'} />
      </section>

      {/* Grafico incassi per mese */}
      <section className="mt-6 rounded-xl border border-white/10 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Incassi per mese
        </h2>
        <div className="mt-4 flex items-end gap-2" style={{ height: 176 }}>
          {incassi && incassi.perMese.length > 0 ? (
            incassi.perMese.map((m) => (
              <div
                key={m.mese}
                className="flex flex-1 flex-col items-center justify-end gap-1"
                style={{ height: '100%' }}
              >
                <span className="text-[10px] text-white/50">{EUR.format(m.totale)}</span>
                <div
                  className="w-full rounded-t bg-indigo-500"
                  style={{ height: Math.max(2, Math.round((m.totale / maxMese) * 140)) }}
                  title={EUR.format(m.totale)}
                />
                <span className="text-[10px] text-white/40">{m.mese}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40">Nessuna vendita registrata.</p>
          )}
        </div>
      </section>

      {/* Kanban lead */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Pipeline lead
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {COLONNE.map((col) => {
            const items = leads.filter((l) => l.stato === col.stato);
            return (
              <div key={col.stato} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                  <span className="rounded-full bg-white/10 px-2 text-xs text-white/60">
                    {items.length}
                  </span>
                </div>
                <ul className="mt-2 space-y-2">
                  {items.map((l) => (
                    <li key={l.id} className="rounded-lg bg-black/30 p-2 text-sm">
                      <p className="font-medium">{l.nome}</p>
                      {l.valoreStimato && (
                        <p className="text-xs text-white/50">
                          {EUR.format(Number(l.valoreStimato))}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Artisti */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Artisti ({artists.length})
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {artists.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-white/10 p-3"
            >
              <div>
                <p className="font-medium">{a.nome}</p>
                <p className="text-xs text-white/50">
                  {[a.citta, a.genereMusicale].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                {a.piano}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
