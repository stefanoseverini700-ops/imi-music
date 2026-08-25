'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { authGet, getToken, logout, urlDownload } from '@/lib/api-client';
import type { Notifica, PortalePanoramica } from '@/lib/dto';
import { Modal } from '@/components/Modal';
import { CambiaPasswordForm } from '@/components/forms';

const DATA = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export default function PortalePage() {
  const router = useRouter();
  const [dati, setDati] = useState<PortalePanoramica | null>(null);
  const [notifiche, setNotifiche] = useState<Notifica[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cambioPassword, setCambioPassword] = useState(false);

  const refresh = useCallback(() => {
    authGet<PortalePanoramica>('/api/portale')
      .then((d) => {
        setDati(d);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.message === 'unauthorized') router.replace('/login');
        else setError(e.message);
      });
    authGet<Notifica[]>('/api/notifiche')
      .then(setNotifiche)
      .catch(() => setNotifiche([]));
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    refresh();
  }, [router, refresh]);

  const nonLette = notifiche.filter((n) => !n.letto).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{dati?.artista.nome ?? 'Il mio spazio'}</h1>
          <p className="text-sm text-white/50">
            {dati
              ? [dati.artista.citta, dati.artista.genereMusicale].filter(Boolean).join(' · ') ||
                'Portale artista'
              : 'Portale artista'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dati && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Piano {dati.artista.piano}
            </span>
          )}
          {nonLette > 0 && (
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
              🔔 {nonLette}
            </span>
          )}
          <button
            onClick={() => setCambioPassword(true)}
            title="Cambia password"
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            🔑
          </button>
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

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {dati && (
        <>
          {/* Avanzamento dei servizi */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              I miei servizi
            </h2>
            {dati.piani.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">Nessun servizio in corso al momento.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {dati.piani.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{p.stato}</span>
                      <span className="text-sm font-semibold">{p.avanzamento}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${p.avanzamento}%` }}
                      />
                    </div>
                    <ul className="mt-3 space-y-2">
                      {p.fasi.map((f) => (
                        <li key={f.id} className="flex items-center gap-3 text-sm">
                          <span className="w-40 shrink-0 truncate">{f.nome}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-indigo-400"
                              style={{ width: `${f.percentuale}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs text-white/50">
                            {f.percentuale}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Discografia */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Le mie uscite ({dati.releases.length})
            </h2>
            {dati.releases.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">Nessuna uscita registrata.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dati.releases.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
                  >
                    <div>
                      <p className="font-medium">{r.titolo}</p>
                      <p className="text-xs text-white/50">
                        {r.stato}
                        {r.dataUscita ? ` · ${DATA.format(new Date(r.dataUscita))}` : ''}
                        {r.genere ? ` · ${r.genere}` : ''}
                      </p>
                    </div>
                    {r.isrc && <span className="text-xs text-white/40">ISRC {r.isrc}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Proposte live */}
          {dati.eventi.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Proposte live ({dati.eventi.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {dati.eventi.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 p-3"
                  >
                    <div>
                      <p className="font-medium">{e.venue?.nome ?? 'Data da definire'}</p>
                      <p className="text-xs text-white/50">
                        {e.venue?.citta ? `${e.venue.citta} · ` : ''}
                        {DATA.format(new Date(e.data))}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      {e.stato}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Materiale */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Il mio materiale ({dati.files.length})
            </h2>
            {dati.files.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">Nessun file condiviso.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dati.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{f.nomeFile}</p>
                      <p className="text-xs text-white/50">
                        {f.department?.nome ?? 'Generale'} · {f.tipo}
                      </p>
                    </div>
                    <a
                      href={urlDownload(f.id)}
                      className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      Scarica
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Richieste di assistenza */}
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Le mie richieste ({dati.tickets.length})
            </h2>
            {dati.tickets.length === 0 ? (
              <p className="mt-3 text-sm text-white/40">Nessuna richiesta aperta.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {dati.tickets.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3"
                  >
                    <div>
                      <p className="font-medium">{t.oggetto}</p>
                      <p className="text-xs text-white/50">
                        {t.department?.nome ?? 'Generale'}
                        {t._count ? ` · ${t._count.messages} messaggi` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                      {t.stato}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Notifiche */}
          {notifiche.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                Notifiche
              </h2>
              <ul className="mt-3 space-y-2">
                {notifiche.slice(0, 5).map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-lg p-2 text-sm ${
                      n.letto ? 'bg-black/20 text-white/50' : 'bg-indigo-500/10'
                    }`}
                  >
                    {n.testo}
                    <span className="ml-2 text-xs text-white/40">
                      {DATA.format(new Date(n.createdAt))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {cambioPassword && (
        <Modal title="Cambia password" onClose={() => setCambioPassword(false)}>
          <CambiaPasswordForm onDone={() => setCambioPassword(false)} />
        </Modal>
      )}
    </main>
  );
}
