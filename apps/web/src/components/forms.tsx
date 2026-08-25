'use client';

import { useState } from 'react';
import { AppuntamentoTipo, ArtistPlan, PaymentStatus, Role } from '@imi/shared';
import { authPatch, authPost } from '@/lib/api-client';
import type { Artist, Lead, User } from '@/lib/dto';

const inputCls =
  'mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30';
const labelCls = 'mt-3 block text-sm text-white/70';
const btnCls =
  'mt-5 w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50';

function ErrorText({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-3 text-sm text-red-400">{error}</p>;
}

/** Form: nuovo lead nella pipeline. */
export function NuovoLeadForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [fonte, setFonte] = useState('');
  const [valore, setValore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/leads', {
        nome,
        ...(fonte ? { fonte } : {}),
        ...(valore ? { valoreStimato: Number(valore) } : {}),
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
      <label className={labelCls}>Nome *</label>
      <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} required />
      <label className={labelCls}>Fonte</label>
      <input
        className={inputCls}
        value={fonte}
        onChange={(e) => setFonte(e.target.value)}
        placeholder="Instagram, referral, evento…"
      />
      <label className={labelCls}>Valore stimato (€)</label>
      <input
        className={inputCls}
        type="number"
        min="0"
        step="0.01"
        value={valore}
        onChange={(e) => setValore(e.target.value)}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Crea lead'}
      </button>
    </form>
  );
}

/** Form: modifica un lead esistente. */
export function ModificaLeadForm({ lead, onDone }: { lead: Lead; onDone: () => void }) {
  const [nome, setNome] = useState(lead.nome);
  const [fonte, setFonte] = useState(lead.fonte ?? '');
  const [valore, setValore] = useState(
    lead.valoreStimato ? String(Number(lead.valoreStimato)) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPatch(`/api/leads/${lead.id}`, {
        nome,
        fonte,
        ...(valore ? { valoreStimato: Number(valore) } : {}),
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
      <label className={labelCls}>Nome *</label>
      <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} required />
      <label className={labelCls}>Fonte</label>
      <input className={inputCls} value={fonte} onChange={(e) => setFonte(e.target.value)} />
      <label className={labelCls}>Valore stimato (€)</label>
      <input
        className={inputCls}
        type="number"
        min="0"
        step="0.01"
        value={valore}
        onChange={(e) => setValore(e.target.value)}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Salva modifiche'}
      </button>
    </form>
  );
}

/** Form: nuovo utente dello staff (venditore, operatore, admin). */
export function NuovoUtenteForm({ onDone }: { onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ruolo, setRuolo] = useState<string>(Role.SALES);
  const [dipartimento, setDipartimento] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/users', {
        nome,
        email,
        password,
        ruolo,
        ...(dipartimento ? { dipartimento } : {}),
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
      <label className={labelCls}>Nome *</label>
      <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} required />
      <label className={labelCls}>Email *</label>
      <input
        className={inputCls}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label className={labelCls}>Password * (min. 8 caratteri)</label>
      <input
        className={inputCls}
        type="password"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <label className={labelCls}>Ruolo</label>
      <select className={inputCls} value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
        <option value={Role.SALES}>Sales (venditore)</option>
        <option value={Role.OPERATORE}>Operatore</option>
        <option value={Role.ADMIN}>Admin</option>
        <option value={Role.ARTISTA}>Artista</option>
      </select>
      <label className={labelCls}>Dipartimento</label>
      <input
        className={inputCls}
        value={dipartimento}
        onChange={(e) => setDipartimento(e.target.value)}
        placeholder="es. Produzione, Grafica, SMM"
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Crea utente'}
      </button>
    </form>
  );
}

/** Form: nuova voce del calendario (call, riunione, assenza). */
export function NuovoAppuntamentoForm({ users, onDone }: { users: User[]; onDone: () => void }) {
  const [titolo, setTitolo] = useState('');
  const [inizio, setInizio] = useState('');
  const [tipo, setTipo] = useState<string>(AppuntamentoTipo.CALL);
  const [userId, setUserId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/calendario', {
        titolo,
        inizio: new Date(inizio).toISOString(),
        tipo,
        ...(userId ? { userId } : {}),
        ...(note ? { note } : {}),
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
        placeholder="Call con Luna Nera"
        required
      />
      <label className={labelCls}>Data e ora *</label>
      <input
        className={inputCls}
        type="datetime-local"
        value={inizio}
        onChange={(e) => setInizio(e.target.value)}
        required
      />
      <label className={labelCls}>Tipo</label>
      <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value={AppuntamentoTipo.CALL}>Call</option>
        <option value={AppuntamentoTipo.RIUNIONE}>Riunione</option>
        <option value={AppuntamentoTipo.ASSENZA}>Assenza</option>
      </select>
      {users.length > 0 && (
        <>
          <label className={labelCls}>Membro dello staff</label>
          <select className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Io</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </>
      )}
      <label className={labelCls}>Note</label>
      <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Aggiungi al calendario'}
      </button>
    </form>
  );
}

/** Form: nuovo messaggio nella bacheca feedback. */
export function NuovoFeedbackForm({ onDone }: { onDone: () => void }) {
  const [testo, setTesto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/feedback', { testo });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Messaggio *</label>
      <textarea
        className={`${inputCls} min-h-[7rem]`}
        value={testo}
        onChange={(e) => setTesto(e.target.value)}
        placeholder="Scrivi un feedback per il team…"
        required
        minLength={2}
        maxLength={2000}
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Pubblicazione…' : 'Pubblica'}
      </button>
    </form>
  );
}

/** Form: registra una vendita. */
export function NuovaVenditaForm({ artists, onDone }: { artists: Artist[]; onDone: () => void }) {
  const [artistId, setArtistId] = useState(artists[0]?.id ?? '');
  const [importo, setImporto] = useState('');
  const [statoPagamento, setStatoPagamento] = useState<string>(PaymentStatus.PAGATO);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/sales', {
        artistId,
        importo: Number(importo),
        statoPagamento,
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (artists.length === 0) {
    return <p className="text-sm text-white/60">Prima aggiungi almeno un artista.</p>;
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
      <label className={labelCls}>Importo (€) *</label>
      <input
        className={inputCls}
        type="number"
        min="0.01"
        step="0.01"
        value={importo}
        onChange={(e) => setImporto(e.target.value)}
        required
      />
      <label className={labelCls}>Stato pagamento</label>
      <select
        className={inputCls}
        value={statoPagamento}
        onChange={(e) => setStatoPagamento(e.target.value)}
      >
        <option value={PaymentStatus.PAGATO}>Pagato</option>
        <option value={PaymentStatus.PARZIALE}>Parziale</option>
        <option value={PaymentStatus.IN_ATTESA}>In attesa</option>
      </select>
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Registra vendita'}
      </button>
    </form>
  );
}

/** Form: nuovo artista (con collegamento facoltativo a un account portale). */
export function NuovoArtistaForm({ users = [], onDone }: { users?: User[]; onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [citta, setCitta] = useState('');
  const [genere, setGenere] = useState('');
  const [piano, setPiano] = useState<string>(ArtistPlan.BASE);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Account con ruolo ARTISTA non ancora collegati ad altra scheda.
  const accountArtisti = users.filter((u) => u.ruolo === Role.ARTISTA);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authPost('/api/artists', {
        nome,
        ...(citta ? { citta } : {}),
        ...(genere ? { genereMusicale: genere } : {}),
        ...(userId ? { userId } : {}),
        piano,
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
      <label className={labelCls}>Nome *</label>
      <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} required />
      <label className={labelCls}>Città</label>
      <input className={inputCls} value={citta} onChange={(e) => setCitta(e.target.value)} />
      <label className={labelCls}>Genere musicale</label>
      <input className={inputCls} value={genere} onChange={(e) => setGenere(e.target.value)} />
      <label className={labelCls}>Piano</label>
      <select className={inputCls} value={piano} onChange={(e) => setPiano(e.target.value)}>
        <option value={ArtistPlan.BASE}>Base</option>
        <option value={ArtistPlan.PRO}>Pro</option>
        <option value={ArtistPlan.PREMIUM}>Premium</option>
      </select>
      {accountArtisti.length > 0 && (
        <>
          <label className={labelCls}>Account portale (facoltativo)</label>
          <select className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Nessuno</option>
            {accountArtisti.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome} · {u.email}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-white/40">
            Collegando un account con ruolo Artista, quella persona vedrà il proprio portale.
          </p>
        </>
      )}
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Aggiungi artista'}
      </button>
    </form>
  );
}

/** Form: cambio della propria password (disponibile a ogni ruolo). */
export function CambiaPasswordForm({ onDone }: { onDone: () => void }) {
  const [attuale, setAttuale] = useState('');
  const [nuova, setNuova] = useState('');
  const [conferma, setConferma] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nuova !== conferma) {
      setError('Le due password nuove non coincidono');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authPatch('/api/users/me/password', {
        passwordAttuale: attuale,
        passwordNuova: nuova,
      });
      setOk(true);
      setTimeout(onDone, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (ok) {
    return <p className="text-sm text-green-400">✅ Password aggiornata.</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <label className={labelCls}>Password attuale *</label>
      <input
        className={inputCls}
        type="password"
        value={attuale}
        onChange={(e) => setAttuale(e.target.value)}
        required
      />
      <label className={labelCls}>Nuova password * (min. 8 caratteri)</label>
      <input
        className={inputCls}
        type="password"
        minLength={8}
        value={nuova}
        onChange={(e) => setNuova(e.target.value)}
        required
      />
      <label className={labelCls}>Ripeti la nuova password *</label>
      <input
        className={inputCls}
        type="password"
        minLength={8}
        value={conferma}
        onChange={(e) => setConferma(e.target.value)}
        required
      />
      <ErrorText error={error} />
      <button type="submit" disabled={loading} className={btnCls}>
        {loading ? 'Salvataggio…' : 'Cambia password'}
      </button>
    </form>
  );
}
