'use client';

import { useState } from 'react';
import { FileAssetType, FileOwnerType, TicketPriority } from '@imi/shared';
import { authPost, authUpload } from '@/lib/api-client';
import type { Artist, Dipartimento } from '@/lib/dto';

const inputCls =
  'mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30';
const labelCls = 'mt-3 block text-sm text-white/70';
const btnCls =
  'mt-5 w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50';

function ErrorText({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-3 text-sm text-red-400">{error}</p>;
}

/** Form: apri un nuovo ticket verso un dipartimento. */
export function NuovoTicketForm({
  dipartimenti,
  artists,
  onDone,
}: {
  dipartimenti: Dipartimento[];
  artists: Artist[];
  onDone: () => void;
}) {
  const [oggetto, setOggetto] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [departmentId, setDepartmentId] = useState(dipartimenti[0]?.id ?? '');
  const [artistId, setArtistId] = useState('');
  const [priorita, setPriorita] = useState<string>(TicketPriority.MEDIA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/ticketing/ticket', {
        oggetto,
        messaggio,
        priorita,
        ...(departmentId ? { departmentId } : {}),
        ...(artistId ? { artistId } : {}),
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
      <label className={labelCls}>Oggetto *</label>
      <input
        className={inputCls}
        value={oggetto}
        onChange={(e) => setOggetto(e.target.value)}
        placeholder="es. Copertina da rifare"
        required
        minLength={3}
      />
      <label className={labelCls}>Messaggio *</label>
      <textarea
        className={`${inputCls} min-h-[6rem]`}
        value={messaggio}
        onChange={(e) => setMessaggio(e.target.value)}
        required
        minLength={2}
      />
      {dipartimenti.length > 0 && (
        <>
          <label className={labelCls}>Dipartimento</label>
          <select
            className={inputCls}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">Nessuno</option>
            {dipartimenti.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </>
      )}
      {artists.length > 0 && (
        <>
          <label className={labelCls}>Artista collegato</label>
          <select
            className={inputCls}
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
          >
            <option value="">Nessuno</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </>
      )}
      <label className={labelCls}>Priorità</label>
      <select className={inputCls} value={priorita} onChange={(e) => setPriorita(e.target.value)}>
        {Object.values(TicketPriority).map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Apertura…' : 'Apri ticket'}
      </button>
    </form>
  );
}

/** Form: nuovo dipartimento. */
export function NuovoDipartimentoForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/ticketing/dipartimenti', { nome });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Nome dipartimento *</label>
      <input
        className={inputCls}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="es. Produzione"
        required
        minLength={2}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Crea dipartimento'}
      </button>
    </form>
  );
}

/** Form: carica un file nell'area condivisa. */
export function CaricaFileForm({
  dipartimenti,
  artists,
  onDone,
}: {
  dipartimenti: Dipartimento[];
  artists: Artist[];
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [ownerId, setOwnerId] = useState(artists[0]?.id ?? '');
  const [departmentId, setDepartmentId] = useState('');
  const [tipo, setTipo] = useState<string>(FileAssetType.ALTRO);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (artists.length === 0) {
    return <p className="text-sm text-white/60">Prima aggiungi almeno un artista.</p>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Seleziona un file');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('ownerType', FileOwnerType.ARTIST);
      form.append('ownerId', ownerId);
      form.append('tipo', tipo);
      if (departmentId) form.append('departmentId', departmentId);
      await authUpload('/api/files/upload', form);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>File *</label>
      <input
        className={inputCls}
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
      />
      <label className={labelCls}>Artista *</label>
      <select className={inputCls} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
        {artists.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </select>
      <label className={labelCls}>Cartella (dipartimento)</label>
      <select
        className={inputCls}
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
      >
        <option value="">Generale</option>
        {dipartimenti.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
      <label className={labelCls}>Tipo</label>
      <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
        {Object.values(FileAssetType).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Caricamento…' : 'Carica file'}
      </button>
    </form>
  );
}
