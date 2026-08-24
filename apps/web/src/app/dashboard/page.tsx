'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LeadStatus, Role } from '@imi/shared';
import { authDelete, authGet, authPatch, getToken, logout } from '@/lib/api-client';
import type {
  Appuntamento,
  Artist,
  Feedback,
  IncassiDashboard,
  KpiVenditore,
  Lead,
  User,
} from '@/lib/dto';
import { Modal } from '@/components/Modal';
import {
  ModificaLeadForm,
  NuovoAppuntamentoForm,
  NuovoArtistaForm,
  NuovoFeedbackForm,
  NuovoLeadForm,
  NuovoUtenteForm,
  NuovaVenditaForm,
} from '@/components/forms';

const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

const COLONNE: { stato: LeadStatus; label: string }[] = [
  { stato: LeadStatus.NUOVO, label: 'Nuovo' },
  { stato: LeadStatus.QUALIFICATO, label: 'Qualificato' },
  { stato: LeadStatus.IN_TRATTATIVA, label: 'In trattativa' },
  { stato: LeadStatus.VINTO, label: 'Vinto' },
  { stato: LeadStatus.PERSO, label: 'Perso' },
];

type ModalKind = 'lead' | 'vendita' | 'artista' | 'utente' | 'appuntamento' | 'feedback' | null;

const DATA_ORA = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const TIPO_LABEL: Record<string, string> = {
  CALL: '📞 Call',
  RIUNIONE: '👥 Riunione',
  ASSENZA: '🌴 Assenza',
};

export default function DashboardPage() {
  const router = useRouter();
  const [incassi, setIncassi] = useState<IncassiDashboard | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [kpi, setKpi] = useState<KpiVenditore[]>([]);
  const [agenda, setAgenda] = useState<Appuntamento[]>([]);
  const [bacheca, setBacheca] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [leadInModifica, setLeadInModifica] = useState<Lead | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  const refresh = useCallback(() => {
    Promise.all([
      authGet<IncassiDashboard>('/api/sales/dashboard/incassi'),
      authGet<Lead[]>('/api/leads'),
      authGet<Artist[]>('/api/artists'),
      authGet<KpiVenditore[]>('/api/sales/dashboard/kpi'),
      authGet<Appuntamento[]>('/api/calendario'),
      authGet<Feedback[]>('/api/feedback'),
    ])
      .then(([i, l, a, k, c, f]) => {
        setIncassi(i);
        setLeads(l);
        setArtists(a);
        setKpi(k);
        setAgenda(c);
        setBacheca(f);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.message === 'unauthorized') router.replace('/login');
        else setError(e.message);
      });
    // Elenco utenti: solo gli Admin possono leggerlo, per gli altri resta vuoto.
    authGet<User[]>('/api/users')
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    refresh();
  }, [router, refresh]);

  /** Sposta un lead in una colonna specifica del kanban. */
  async function setLeadStato(lead: Lead, stato: LeadStatus) {
    if (lead.stato === stato || busyId) return;
    setBusyId(lead.id);
    // Aggiornamento ottimistico: la scheda si muove subito.
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stato } : l)));
    try {
      await authPatch(`/api/leads/${lead.id}/stato`, { stato });
    } catch (e) {
      setError((e as Error).message);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stato: lead.stato } : l)));
    } finally {
      setBusyId(null);
    }
  }

  function moveLead(lead: Lead, direction: -1 | 1) {
    const idx = COLONNE.findIndex((c) => c.stato === lead.stato);
    const target = COLONNE[idx + direction];
    if (target) void setLeadStato(lead, target.stato);
  }

  async function assegnaLead(lead: Lead, userId: string) {
    setBusyId(lead.id);
    try {
      await authPatch(`/api/leads/${lead.id}/assegna`, { assegnatoA: userId });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, assegnatoA: userId } : l)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function eliminaLead(lead: Lead) {
    if (!confirm(`Eliminare il lead "${lead.nome}"?`)) return;
    setBusyId(lead.id);
    try {
      await authDelete(`/api/leads/${lead.id}`);
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function eliminaAppuntamento(a: Appuntamento) {
    try {
      await authDelete(`/api/calendario/${a.id}`);
      setAgenda((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function chiudiEAggiorna() {
    setModal(null);
    setLeadInModifica(null);
    refresh();
  }

  const maxMese = incassi ? Math.max(1, ...incassi.perMese.map((m) => m.totale)) : 1;
  const venditori = users.filter((u) => u.ruolo === Role.SALES || u.ruolo === Role.ADMIN);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cruscotto</h1>
          <p className="text-sm text-white/50">Gestionale IMI Music</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BtnAzione onClick={() => setModal('lead')}>➕ Lead</BtnAzione>
          <BtnAzione onClick={() => setModal('vendita')}>➕ Vendita</BtnAzione>
          <BtnAzione onClick={() => setModal('artista')}>➕ Artista</BtnAzione>
          <BtnAzione onClick={() => setModal('utente')}>➕ Utente</BtnAzione>
          <BtnAzione onClick={() => setModal('appuntamento')}>📅 Agenda</BtnAzione>
          <BtnAzione onClick={() => setModal('feedback')}>💬 Feedback</BtnAzione>
          <Link
            href="/delivery"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            Delivery →
          </Link>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            Esci
          </button>
        </div>
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

      {/* KPI per venditore */}
      {kpi.length > 0 && (
        <section className="mt-6 overflow-x-auto rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            KPI per venditore
          </h2>
          <table className="mt-3 w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-white/40">
                <th className="pb-2">Venditore</th>
                <th className="pb-2 text-right">Vendite</th>
                <th className="pb-2 text-right">Questo mese</th>
                <th className="pb-2 text-right">Totale</th>
                <th className="pb-2 text-right">Ticket medio</th>
              </tr>
            </thead>
            <tbody>
              {kpi.map((k) => (
                <tr key={k.venditoreId ?? 'nessuno'} className="border-t border-white/5">
                  <td className="py-2 font-medium">{k.nome}</td>
                  <td className="py-2 text-right text-white/70">{k.numeroVendite}</td>
                  <td className="py-2 text-right text-white/70">{EUR.format(k.totaleMese)}</td>
                  <td className="py-2 text-right font-semibold">{EUR.format(k.totale)}</td>
                  <td className="py-2 text-right text-white/70">{EUR.format(k.ticketMedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Kanban lead */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Pipeline lead
          </h2>
          <span className="text-xs text-white/40">trascina una scheda, oppure usa ‹ ›</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {COLONNE.map((col, colIdx) => {
            const items = leads.filter((l) => l.stato === col.stato);
            return (
              <div
                key={col.stato}
                data-colonna={col.stato}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.stato);
                }}
                onDragLeave={() => setDragOver((s) => (s === col.stato ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  const id = e.dataTransfer.getData('text/plain');
                  const lead = leads.find((l) => l.id === id);
                  if (lead) void setLeadStato(lead, col.stato);
                }}
                className={`min-h-[7rem] rounded-xl border p-3 transition-colors ${
                  dragOver === col.stato
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                  <span className="rounded-full bg-white/10 px-2 text-xs text-white/60">
                    {items.length}
                  </span>
                </div>
                <ul className="mt-2 space-y-2">
                  {items.map((l) => (
                    <li
                      key={l.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)}
                      className={`cursor-grab rounded-lg bg-black/30 p-2 text-sm active:cursor-grabbing ${
                        busyId === l.id ? 'opacity-50' : ''
                      }`}
                    >
                      <p className="font-medium">{l.nome}</p>
                      {l.valoreStimato && (
                        <p className="text-xs text-white/50">
                          {EUR.format(Number(l.valoreStimato))}
                        </p>
                      )}

                      {venditori.length > 0 && (
                        <select
                          value={l.assegnatoA ?? ''}
                          onChange={(e) => void assegnaLead(l, e.target.value)}
                          aria-label={`Assegna ${l.nome}`}
                          className="mt-1 w-full rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[11px] text-white/70"
                        >
                          <option value="">Non assegnato</option>
                          {venditori.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nome}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="mt-1 flex items-center justify-between">
                        <button
                          onClick={() => moveLead(l, -1)}
                          disabled={colIdx === 0 || busyId === l.id}
                          aria-label="Sposta indietro"
                          className="rounded px-1.5 text-white/50 hover:bg-white/10 disabled:invisible"
                        >
                          ‹
                        </button>
                        <span className="flex gap-1">
                          <button
                            onClick={() => {
                              setLeadInModifica(l);
                            }}
                            aria-label={`Modifica ${l.nome}`}
                            title="Modifica"
                            className="rounded px-1 text-white/40 hover:bg-white/10 hover:text-white/80"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => void eliminaLead(l)}
                            aria-label={`Elimina ${l.nome}`}
                            title="Elimina"
                            className="rounded px-1 text-white/40 hover:bg-white/10 hover:text-red-400"
                          >
                            🗑
                          </button>
                        </span>
                        <button
                          onClick={() => moveLead(l, 1)}
                          disabled={colIdx === COLONNE.length - 1 || busyId === l.id}
                          aria-label="Sposta avanti"
                          className="rounded px-1.5 text-white/50 hover:bg-white/10 disabled:invisible"
                        >
                          ›
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Calendario e bacheca */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Calendario ({agenda.length})
          </h2>
          {agenda.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">
              Nessun appuntamento. Usa 📅 Agenda per aggiungerne uno.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {agenda.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-lg bg-black/20 p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{a.titolo}</p>
                    <p className="text-xs text-white/50">
                      {TIPO_LABEL[a.tipo] ?? a.tipo} · {DATA_ORA.format(new Date(a.inizio))}
                      {a.user ? ` · ${a.user.nome}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => void eliminaAppuntamento(a)}
                    aria-label={`Elimina ${a.titolo}`}
                    className="rounded px-1 text-white/30 hover:bg-white/10 hover:text-red-400"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Bacheca feedback ({bacheca.length})
          </h2>
          {bacheca.length === 0 ? (
            <p className="mt-3 text-sm text-white/40">
              Nessun messaggio. Usa 💬 Feedback per scriverne uno.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {bacheca.slice(0, 8).map((f) => (
                <li key={f.id} className="rounded-lg bg-black/20 p-2 text-sm">
                  <p className="whitespace-pre-wrap">{f.testo}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {f.autore?.nome ?? 'Anonimo'} · {DATA_ORA.format(new Date(f.createdAt))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

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

      {/* Team */}
      {users.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Team ({users.length})
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-white/10 p-3"
              >
                <div>
                  <p className="font-medium">{u.nome}</p>
                  <p className="text-xs text-white/50">
                    {u.email}
                    {u.dipartimento ? ` · ${u.dipartimento}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {u.ruolo}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Modali */}
      {modal === 'lead' && (
        <Modal title="Nuovo lead" onClose={() => setModal(null)}>
          <NuovoLeadForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'vendita' && (
        <Modal title="Registra vendita" onClose={() => setModal(null)}>
          <NuovaVenditaForm artists={artists} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'artista' && (
        <Modal title="Nuovo artista" onClose={() => setModal(null)}>
          <NuovoArtistaForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'utente' && (
        <Modal title="Nuovo utente" onClose={() => setModal(null)}>
          <NuovoUtenteForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'appuntamento' && (
        <Modal title="Nuovo appuntamento" onClose={() => setModal(null)}>
          <NuovoAppuntamentoForm users={users} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'feedback' && (
        <Modal title="Nuovo feedback" onClose={() => setModal(null)}>
          <NuovoFeedbackForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {leadInModifica && (
        <Modal title="Modifica lead" onClose={() => setLeadInModifica(null)}>
          <ModificaLeadForm lead={leadInModifica} onDone={chiudiEAggiorna} />
        </Modal>
      )}
    </main>
  );
}

function BtnAzione({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400"
    >
      {children}
    </button>
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
