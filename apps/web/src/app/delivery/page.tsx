'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TaskStatus } from '@imi/shared';
import { authDelete, authGet, authPatch, getToken, logout } from '@/lib/api-client';
import type { Artist, DeliveryPiano, Release, Servizio, Task, User } from '@/lib/dto';
import { Modal } from '@/components/Modal';
import {
  CATEGORIA_LABEL,
  LabelCopyForm,
  NuovaFaseForm,
  NuovaReleaseForm,
  NuovoPianoForm,
  NuovoServizioForm,
  NuovoTaskForm,
} from '@/components/delivery-forms';

const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const DATA = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });

const TASK_STATI: { stato: TaskStatus; label: string }[] = [
  { stato: TaskStatus.DA_FARE, label: 'Da fare' },
  { stato: TaskStatus.IN_CORSO, label: 'In corso' },
  { stato: TaskStatus.IN_REVISIONE, label: 'In revisione' },
  { stato: TaskStatus.COMPLETATO, label: 'Completato' },
];

type ModalKind = 'servizio' | 'piano' | 'task' | 'release' | null;

export default function DeliveryPage() {
  const router = useRouter();
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [piani, setPiani] = useState<DeliveryPiano[]>([]);
  const [task, setTask] = useState<Task[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [faseDiPiano, setFaseDiPiano] = useState<DeliveryPiano | null>(null);
  const [labelCopyDi, setLabelCopyDi] = useState<Release | null>(null);

  const refresh = useCallback(() => {
    Promise.all([
      authGet<Servizio[]>('/api/servizi'),
      authGet<DeliveryPiano[]>('/api/delivery/piani'),
      authGet<Task[]>('/api/delivery/task'),
      authGet<Release[]>('/api/releases'),
      authGet<Artist[]>('/api/artists'),
    ])
      .then(([s, p, t, r, a]) => {
        setServizi(s);
        setPiani(p);
        setTask(t);
        setReleases(r);
        setArtists(a);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.message === 'unauthorized') router.replace('/login');
        else setError(e.message);
      });
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

  async function aggiornaAvanzamento(stageId: string, percentuale: number) {
    setPiani((prev) =>
      prev.map((p) => ({
        ...p,
        stages: p.stages.map((s) => (s.id === stageId ? { ...s, percentuale } : s)),
        avanzamento: (() => {
          const st = p.stages.map((s) => (s.id === stageId ? { ...s, percentuale } : s));
          return st.length ? Math.round(st.reduce((a, b) => a + b.percentuale, 0) / st.length) : 0;
        })(),
      })),
    );
    try {
      await authPatch(`/api/delivery/fasi/${stageId}`, { percentuale });
    } catch (e) {
      setError((e as Error).message);
      refresh();
    }
  }

  async function cambiaStatoTask(t: Task, stato: TaskStatus) {
    setTask((prev) => prev.map((x) => (x.id === t.id ? { ...x, stato } : x)));
    try {
      await authPatch(`/api/delivery/task/${t.id}`, { stato });
    } catch (e) {
      setError((e as Error).message);
      refresh();
    }
  }

  async function eliminaFase(stageId: string) {
    if (!confirm('Eliminare questa fase?')) return;
    try {
      await authDelete(`/api/delivery/fasi/${stageId}`);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function chiudiEAggiorna() {
    setModal(null);
    setFaseDiPiano(null);
    setLabelCopyDi(null);
    refresh();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Delivery</h1>
          <p className="text-sm text-white/50">Servizi, piani di erogazione, task e release</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            ← Cruscotto
          </Link>
          <Link
            href="/ticketing"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            Ticketing →
          </Link>
          <Btn onClick={() => setModal('servizio')}>➕ Servizio</Btn>
          <Btn onClick={() => setModal('piano')}>➕ Piano</Btn>
          <Btn onClick={() => setModal('task')}>➕ Task</Btn>
          <Btn onClick={() => setModal('release')}>➕ Release</Btn>
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

      {/* Catalogo servizi */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Catalogo servizi ({servizi.length})
        </h2>
        {servizi.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            Nessun servizio. Usa ➕ Servizio per creare il catalogo.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {servizi.map((s) => (
              <li
                key={s.id}
                className={`flex items-center justify-between rounded-lg border border-white/10 p-3 ${
                  s.attivo ? '' : 'opacity-40'
                }`}
              >
                <div>
                  <p className="font-medium">{s.nome}</p>
                  <p className="text-xs text-white/50">
                    {CATEGORIA_LABEL[s.categoria] ?? s.categoria}
                  </p>
                </div>
                <span className="text-sm text-white/70">{EUR.format(Number(s.prezzoBase))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Piani di delivery */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Piani di delivery ({piani.length})
        </h2>
        {piani.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            Nessun piano. Usa ➕ Piano per crearne uno per un artista.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {piani.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.artist.nome}</p>
                    <p className="text-xs text-white/50">{p.stato}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{p.avanzamento}%</span>
                    <button
                      onClick={() => setFaseDiPiano(p)}
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      ➕ Fase
                    </button>
                  </div>
                </div>

                {/* Barra avanzamento complessiva */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${p.avanzamento}%` }}
                  />
                </div>

                {p.stages.length === 0 ? (
                  <p className="mt-3 text-xs text-white/40">
                    Nessuna fase. Aggiungine una col pulsante ➕ Fase.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {p.stages.map((s) => (
                      <li key={s.id} className="rounded-lg bg-black/20 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{s.service.nome}</p>
                            <p className="text-xs text-white/40">
                              {CATEGORIA_LABEL[s.service.categoria] ?? s.service.categoria}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={s.percentuale}
                              aria-label={`Avanzamento ${s.service.nome}`}
                              onChange={(e) =>
                                void aggiornaAvanzamento(s.id, Number(e.target.value))
                              }
                              className="w-28 accent-indigo-500"
                            />
                            <span className="w-10 text-right text-xs text-white/60">
                              {s.percentuale}%
                            </span>
                            <button
                              onClick={() => void eliminaFase(s.id)}
                              aria-label={`Elimina fase ${s.service.nome}`}
                              className="rounded px-1 text-white/30 hover:bg-white/10 hover:text-red-400"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Task */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Task ({task.length})
        </h2>
        {task.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">Nessun task. Usa ➕ Task per crearne uno.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TASK_STATI.map((col) => {
              const items = task.filter((t) => t.stato === col.stato);
              return (
                <div key={col.stato} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/70">{col.label}</span>
                    <span className="rounded-full bg-white/10 px-2 text-xs text-white/60">
                      {items.length}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {items.map((t) => (
                      <li key={t.id} className="rounded-lg bg-black/30 p-2 text-sm">
                        <p className="font-medium">{t.titolo}</p>
                        <p className="text-xs text-white/50">
                          {t.assegnato?.nome ?? 'Non assegnato'}
                          {t.scadenza ? ` · ${DATA.format(new Date(t.scadenza))}` : ''}
                        </p>
                        <select
                          value={t.stato}
                          onChange={(e) => void cambiaStatoTask(t, e.target.value as TaskStatus)}
                          aria-label={`Stato di ${t.titolo}`}
                          className="mt-1 w-full rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[11px] text-white/70"
                        >
                          {TASK_STATI.map((s) => (
                            <option key={s.stato} value={s.stato}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Release */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Release ({releases.length})
        </h2>
        {releases.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            Nessuna release. Usa ➕ Release per aggiungerne una.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {releases.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
              >
                <div>
                  <p className="font-medium">
                    {r.titolo} <span className="text-white/40">· {r.artist.nome}</span>
                  </p>
                  <p className="text-xs text-white/50">
                    {r.stato}
                    {r.dataUscita ? ` · ${DATA.format(new Date(r.dataUscita))}` : ''}
                    {r.genere ? ` · ${r.genere}` : ''}
                    {r.labelCopy ? ' · Label Copy ✓' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setLabelCopyDi(r)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                >
                  Label Copy
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modali */}
      {modal === 'servizio' && (
        <Modal title="Nuovo servizio" onClose={() => setModal(null)}>
          <NuovoServizioForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'piano' && (
        <Modal title="Nuovo piano di delivery" onClose={() => setModal(null)}>
          <NuovoPianoForm artists={artists} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'task' && (
        <Modal title="Nuovo task" onClose={() => setModal(null)}>
          <NuovoTaskForm users={users} piani={piani} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'release' && (
        <Modal title="Nuova release" onClose={() => setModal(null)}>
          <NuovaReleaseForm artists={artists} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {faseDiPiano && (
        <Modal title="Aggiungi fase" onClose={() => setFaseDiPiano(null)}>
          <NuovaFaseForm piano={faseDiPiano} servizi={servizi} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {labelCopyDi && (
        <Modal title="Label Copy" onClose={() => setLabelCopyDi(null)}>
          <LabelCopyForm release={labelCopyDi} onDone={chiudiEAggiorna} />
        </Modal>
      )}
    </main>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400"
    >
      {children}
    </button>
  );
}
