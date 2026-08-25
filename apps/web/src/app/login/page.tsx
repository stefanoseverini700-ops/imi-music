'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { login, ruoloCorrente } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@imimusic.local');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Gli artisti entrano nel portale in sola lettura, lo staff nel cruscotto.
      router.push(ruoloCorrente() === 'ARTISTA' ? '/portale' : '/dashboard');
    } catch {
      setError('Credenziali non valide');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-2xl font-bold">Gestionale IMI Music</h1>
        <p className="mt-1 text-sm text-white/50">Accedi al gestionale</p>

        <label className="mt-6 block text-sm text-white/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
        />

        <label className="mt-4 block text-sm text-white/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-white/30"
        />

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </main>
  );
}
