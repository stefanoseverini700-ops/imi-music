'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TicketStatus } from '@imi/shared';
import {
  authDelete,
  authGet,
  authPatch,
  authPost,
  getToken,
  logout,
  urlDownload,
} from '@/lib/api-client';
import type {
  AppConfig,
  Artist,
  Dipartimento,
  FileAsset,
  Ticket,
  TicketDettaglio,
  User,
} from '@/lib/dto';
import { Modal } from '@/components/Modal';
import {
  CaricaFileForm,
  NuovoDipartimentoForm,
  NuovoTicketForm,
} from '@/components/ticketing-forms';

const DATA = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const STATI: { stato: TicketStatus; label: string }[] = [
  { stato: TicketStatus.APERTO, label: 'Aperto' },
  { stato: TicketStatus.IN_LAVORAZIONE, label: 'In lavorazione' },
  { stato: TicketStatus.IN_ATTESA, label: 'In attesa' },
  { stato: TicketStatus.RISOLTO, label: 'Risolto' },
  { stato: TicketStatus.CHIUSO, label: 'Chiuso' },
];

const COLORE_PRIORITA: Record<string, string> = {
  BASSA: 'bg-white/10 text-white/60',
  MEDIA: 'bg-sky-500/20 text-sky-300',
  ALTA: 'bg-amber-500/20 text-amber-300',
  URGENTE: 'bg-red-500/20 text-red-300',
};

type ModalKind = 'ticket' | 'dipartimento' | 'file' | null;

export default function TicketingPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [dipartimenti, setDipartimenti] = useState<Dipartimento[]>([]);
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [aperto, setAperto] = useState<TicketDettaglio | null>(null);
  const [risposta, setRisposta] = useState('');
  const [filtroCartella, setFiltroCartella] = useState('');
  const [config, setConfig] = useState<AppConfig | null>(null);

  const refresh = useCallback(() => {
    Promise.all([
      authGet<Ticket[]>('/api/ticketing/ticket'),
      authGet<Dipartimento[]>('/api/ticketing/dipartimenti'),
      authGet<FileAsset[]>('/api/files'),
      authGet<Artist[]>('/api/artists'),
    ])
      .then(([t, d, f, a]) => {
        setTickets(t);
        setDipartimenti(d);
        setFiles(f);
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
    authGet<AppConfig>('/api/config')
      .then(setConfig)
      .catch(() => setConfig(null));
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    refresh();
  }, [router, refresh]);

  async function apriTicket(t: Ticket) {
    try {
      setAperto(await authGet<TicketDettaglio>(`/api/ticketing/ticket/${t.id}`));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function inviaRisposta() {
    if (!aperto || !risposta.trim()) return;
    try {
      await authPost(`/api/ticketing/ticket/${aperto.id}/messaggi`, { testo: risposta });
      setRisposta('');
      setAperto(await authGet<TicketDettaglio>(`/api/ticketing/ticket/${aperto.id}`));
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function cambiaStato(t: Ticket, stato: TicketStatus) {
    setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, stato } : x)));
    try {
      await authPatch(`/api/ticketing/ticket/${t.id}`, { stato });
    } catch (e) {
      setError((e as Error).message);
      refresh();
    }
  }

  async function assegna(t: Ticket, userId: string) {
    try {
      await authPatch(`/api/ticketing/ticket/${t.id}`, { assegnatoA: userId });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function eliminaFile(f: FileAsset) {
    if (!confirm(`Eliminare "${f.nomeFile}"?`)) return;
    try {
      await authDelete(`/api/files/${f.id}`);
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function chiudiEAggiorna() {
    setModal(null);
    refresh();
  }

  const fileFiltrati = filtroCartella
    ? files.filter((f) => f.department?.id === filtroCartella)
    : files;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ticketing &amp; File</h1>
          <p className="text-sm text-white/50">Supporto interno e area condivisa</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            ← Cruscotto
          </Link>
          <Btn onClick={() => setModal('ticket')}>➕ Ticket</Btn>
          <Btn onClick={() => setModal('file')}>📎 File</Btn>
          <Btn onClick={() => setModal('dipartimento')}>➕ Dipartimento</Btn>
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

      {/* Ticket */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Ticket ({tickets.length})
        </h2>
        {tickets.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            Nessun ticket. Usa ➕ Ticket per aprirne uno.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-lg border border-white/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      onClick={() => void apriTicket(t)}
                      className="text-left font-medium hover:underline"
                    >
                      {t.oggetto}
                    </button>
                    <p className="text-xs text-white/50">
                      {t.department?.nome ?? 'Senza dipartimento'}
                      {t.artist ? ` · ${t.artist.nome}` : ''}
                      {t.creatore ? ` · da ${t.creatore.nome}` : ''}
                      {t._count ? ` · ${t._count.messages} messaggi` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        COLORE_PRIORITA[t.priorita] ?? 'bg-white/10 text-white/60'
                      }`}
                    >
                      {t.priorita}
                    </span>
                    {users.length > 0 && (
                      <select
                        value={t.assegnato?.id ?? ''}
                        onChange={(e) => void assegna(t, e.target.value)}
                        aria-label={`Assegna ${t.oggetto}`}
                        className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[11px] text-white/70"
                      >
                        <option value="">Non assegnato</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nome}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      value={t.stato}
                      onChange={(e) => void cambiaStato(t, e.target.value as TicketStatus)}
                      aria-label={`Stato di ${t.oggetto}`}
                      className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-[11px] text-white/70"
                    >
                      {STATI.map((s) => (
                        <option key={s.stato} value={s.stato}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Area file */}
      <section className="mt-8">
        {config?.avvisoFileTemporanei && (
          <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            ⚠️ <strong>Archiviazione temporanea.</strong> I file caricati qui vengono persi a ogni
            riavvio del servizio. Durante la fase di prova tenete sempre una copia altrove: non
            usate quest&apos;area come archivio definitivo.
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Area file ({fileFiltrati.length})
          </h2>
          <select
            value={filtroCartella}
            onChange={(e) => setFiltroCartella(e.target.value)}
            aria-label="Filtra per cartella"
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/70"
          >
            <option value="">Tutte le cartelle</option>
            {dipartimenti.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
        {fileFiltrati.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">Nessun file. Usa 📎 File per caricarne uno.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {fileFiltrati.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{f.nomeFile}</p>
                  <p className="text-xs text-white/50">
                    {f.department?.nome ?? 'Generale'} · {f.tipo}
                    {f.caricatore ? ` · ${f.caricatore.nome}` : ''} ·{' '}
                    {DATA.format(new Date(f.createdAt))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={urlDownload(f.id)}
                    className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                  >
                    Scarica
                  </a>
                  <button
                    onClick={() => void eliminaFile(f)}
                    aria-label={`Elimina ${f.nomeFile}`}
                    className="rounded px-1 text-white/30 hover:bg-white/10 hover:text-red-400"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cartelle */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
          Cartelle per ruolo ({dipartimenti.length})
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {dipartimenti.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70"
            >
              📁 {d.nome}{' '}
              <span className="text-white/40">
                ({files.filter((f) => f.department?.id === d.id).length})
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Modali */}
      {modal === 'ticket' && (
        <Modal title="Nuovo ticket" onClose={() => setModal(null)}>
          <NuovoTicketForm dipartimenti={dipartimenti} artists={artists} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'dipartimento' && (
        <Modal title="Nuovo dipartimento" onClose={() => setModal(null)}>
          <NuovoDipartimentoForm onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {modal === 'file' && (
        <Modal title="Carica file" onClose={() => setModal(null)}>
          <CaricaFileForm dipartimenti={dipartimenti} artists={artists} onDone={chiudiEAggiorna} />
        </Modal>
      )}
      {aperto && (
        <Modal title={aperto.oggetto} onClose={() => setAperto(null)}>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {aperto.messages.map((m) => (
              <div key={m.id} className="rounded-lg bg-black/30 p-2 text-sm">
                <p className="whitespace-pre-wrap">{m.testo}</p>
                <p className="mt-1 text-xs text-white/40">
                  {m.autore?.nome ?? 'Anonimo'} · {DATA.format(new Date(m.creatoIl))}
                </p>
              </div>
            ))}
          </div>
          <textarea
            className="mt-3 min-h-[4rem] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
            value={risposta}
            onChange={(e) => setRisposta(e.target.value)}
            placeholder="Scrivi una risposta…"
          />
          <button
            onClick={() => void inviaRisposta()}
            disabled={!risposta.trim()}
            className="mt-2 w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            Invia risposta
          </button>
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
