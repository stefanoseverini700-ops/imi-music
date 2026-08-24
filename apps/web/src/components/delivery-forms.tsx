'use client';

import { useState } from 'react';
import { ReleaseStatus, ServiceCategory, TaskPriority } from '@imi/shared';
import { authPost, authPut } from '@/lib/api-client';
import type { Artist, DeliveryPiano, Release, Servizio, User } from '@/lib/dto';

const inputCls =
  'mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30';
const labelCls = 'mt-3 block text-sm text-white/70';
const btnCls =
  'mt-5 w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50';

function ErrorText({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-3 text-sm text-red-400">{error}</p>;
}

export const CATEGORIA_LABEL: Record<string, string> = {
  DISTRIBUZIONE: 'Distribuzione',
  MANAGEMENT: 'Management',
  ADVERTISING_PROMO: 'Advertising & Promo',
  PITCH_PR: 'Pitch & PR',
  LIVE: 'Live',
  BRANDING: 'Branding',
};

/** Form: nuovo servizio nel catalogo. */
export function NuovoServizioForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<string>(ServiceCategory.DISTRIBUZIONE);
  const [prezzo, setPrezzo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/servizi', { nome, categoria, prezzoBase: Number(prezzo || 0) });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Nome servizio *</label>
      <input
        className={inputCls}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="es. Distribuzione singolo"
        required
      />
      <label className={labelCls}>Categoria</label>
      <select className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        {Object.values(ServiceCategory).map((c) => (
          <option key={c} value={c}>
            {CATEGORIA_LABEL[c] ?? c}
          </option>
        ))}
      </select>
      <label className={labelCls}>Prezzo base (€)</label>
      <input
        className={inputCls}
        type="number"
        min="0"
        step="0.01"
        value={prezzo}
        onChange={(e) => setPrezzo(e.target.value)}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Aggiungi servizio'}
      </button>
    </form>
  );
}

/** Form: nuovo piano di delivery per un artista. */
export function NuovoPianoForm({ artists, onDone }: { artists: Artist[]; onDone: () => void }) {
  const [artistId, setArtistId] = useState(artists[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (artists.length === 0) {
    return <p className="text-sm text-white/60">Prima aggiungi almeno un artista.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/delivery/piani', { artistId });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Artista *</label>
      <select className={inputCls} value={artistId} onChange={(e) => setArtistId(e.target.value)}>
        {artists.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Creazione…' : 'Crea piano'}
      </button>
    </form>
  );
}

/** Form: aggiunge una fase (servizio) a un piano. */
export function NuovaFaseForm({
  piano,
  servizi,
  onDone,
}: {
  piano: DeliveryPiano;
  servizi: Servizio[];
  onDone: () => void;
}) {
  const attivi = servizi.filter((s) => s.attivo);
  const [serviceId, setServiceId] = useState(attivi[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (attivi.length === 0) {
    return <p className="text-sm text-white/60">Prima aggiungi un servizio al catalogo.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost(`/api/delivery/piani/${piano.id}/fasi`, { serviceId });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="text-sm text-white/50">Piano di {piano.artist.nome}</p>
      <label className={labelCls}>Servizio *</label>
      <select className={inputCls} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
        {attivi.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome} · {CATEGORIA_LABEL[s.categoria] ?? s.categoria}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Aggiunta…' : 'Aggiungi fase'}
      </button>
    </form>
  );
}

/** Form: nuovo task. */
export function NuovoTaskForm({
  users,
  piani,
  onDone,
}: {
  users: User[];
  piani: DeliveryPiano[];
  onDone: () => void;
}) {
  const fasi = piani.flatMap((p) =>
    p.stages.map((s) => ({ id: s.id, label: `${p.artist.nome} · ${s.service.nome}` })),
  );
  const [titolo, setTitolo] = useState('');
  const [assegnatoA, setAssegnatoA] = useState('');
  const [deliveryStageId, setDeliveryStageId] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [priorita, setPriorita] = useState<string>(TaskPriority.MEDIA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/delivery/task', {
        titolo,
        priorita,
        ...(assegnatoA ? { assegnatoA } : {}),
        ...(deliveryStageId ? { deliveryStageId } : {}),
        ...(scadenza ? { scadenza: new Date(scadenza).toISOString() } : {}),
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Titolo *</label>
      <input
        className={inputCls}
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
        placeholder="es. Preparare artwork copertina"
        required
      />
      {users.length > 0 && (
        <>
          <label className={labelCls}>Assegna a</label>
          <select
            className={inputCls}
            value={assegnatoA}
            onChange={(e) => setAssegnatoA(e.target.value)}
          >
            <option value="">Nessuno</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </>
      )}
      {fasi.length > 0 && (
        <>
          <label className={labelCls}>Collega a una fase</label>
          <select
            className={inputCls}
            value={deliveryStageId}
            onChange={(e) => setDeliveryStageId(e.target.value)}
          >
            <option value="">Nessuna</option>
            {fasi.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </>
      )}
      <label className={labelCls}>Scadenza</label>
      <input
        className={inputCls}
        type="date"
        value={scadenza}
        onChange={(e) => setScadenza(e.target.value)}
      />
      <label className={labelCls}>Priorità</label>
      <select className={inputCls} value={priorita} onChange={(e) => setPriorita(e.target.value)}>
        {Object.values(TaskPriority).map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Creazione…' : 'Crea task'}
      </button>
    </form>
  );
}

/** Form: nuova release. */
export function NuovaReleaseForm({ artists, onDone }: { artists: Artist[]; onDone: () => void }) {
  const [artistId, setArtistId] = useState(artists[0]?.id ?? '');
  const [titolo, setTitolo] = useState('');
  const [dataUscita, setDataUscita] = useState('');
  const [genere, setGenere] = useState('');
  const [stato, setStato] = useState<string>(ReleaseStatus.BOZZA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (artists.length === 0) {
    return <p className="text-sm text-white/60">Prima aggiungi almeno un artista.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/releases', {
        artistId,
        titolo,
        stato,
        ...(dataUscita ? { dataUscita: new Date(dataUscita).toISOString() } : {}),
        ...(genere ? { genere } : {}),
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Artista *</label>
      <select className={inputCls} value={artistId} onChange={(e) => setArtistId(e.target.value)}>
        {artists.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </select>
      <label className={labelCls}>Titolo *</label>
      <input
        className={inputCls}
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
        required
      />
      <label className={labelCls}>Data di uscita</label>
      <input
        className={inputCls}
        type="date"
        value={dataUscita}
        onChange={(e) => setDataUscita(e.target.value)}
      />
      <label className={labelCls}>Genere</label>
      <input className={inputCls} value={genere} onChange={(e) => setGenere(e.target.value)} />
      <label className={labelCls}>Stato</label>
      <select className={inputCls} value={stato} onChange={(e) => setStato(e.target.value)}>
        {Object.values(ReleaseStatus).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Creazione…' : 'Crea release'}
      </button>
    </form>
  );
}

/** Form: Label Copy di una release (metadati, crediti, link). */
export function LabelCopyForm({ release, onDone }: { release: Release; onDone: () => void }) {
  const lc = release.labelCopy;
  const [autore, setAutore] = useState(lc?.autore ?? '');
  const [compositore, setCompositore] = useState(lc?.compositore ?? '');
  const [editori, setEditori] = useState(lc?.editori ?? '');
  const [linkSpotify, setLinkSpotify] = useState(lc?.linkSpotify ?? '');
  const [linkTiktok, setLinkTiktok] = useState(lc?.linkTiktok ?? '');
  const [bio, setBio] = useState(lc?.bioTerzaPersona ?? '');
  const [pitch, setPitch] = useState(lc?.descrizionePitch ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Regola di business (ARCHITETTURA.md §2): bio minimo 500 parole.
  const paroleBio = bio.trim() ? bio.trim().split(/\s+/).length : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPut(`/api/releases/${release.id}/label-copy`, {
        autore,
        compositore,
        editori,
        linkSpotify,
        linkTiktok,
        bioTerzaPersona: bio,
        descrizionePitch: pitch,
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-sm text-white/50">
        {release.titolo} · {release.artist.nome}
      </p>
      <label className={labelCls}>Autore</label>
      <input className={inputCls} value={autore} onChange={(e) => setAutore(e.target.value)} />
      <label className={labelCls}>Compositore</label>
      <input
        className={inputCls}
        value={compositore}
        onChange={(e) => setCompositore(e.target.value)}
      />
      <label className={labelCls}>Editori</label>
      <input className={inputCls} value={editori} onChange={(e) => setEditori(e.target.value)} />
      <label className={labelCls}>Link Spotify</label>
      <input
        className={inputCls}
        value={linkSpotify}
        onChange={(e) => setLinkSpotify(e.target.value)}
      />
      <label className={labelCls}>Link TikTok</label>
      <input
        className={inputCls}
        value={linkTiktok}
        onChange={(e) => setLinkTiktok(e.target.value)}
      />
      <label className={labelCls}>
        Bio in terza persona{' '}
        <span className={paroleBio >= 500 ? 'text-green-400' : 'text-white/40'}>
          ({paroleBio}/500 parole)
        </span>
      </label>
      <textarea
        className={`${inputCls} min-h-[6rem]`}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <label className={labelCls}>Descrizione / pitch</label>
      <textarea
        className={`${inputCls} min-h-[5rem]`}
        value={pitch}
        onChange={(e) => setPitch(e.target.value)}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Salva Label Copy'}
      </button>
    </form>
  );
}
