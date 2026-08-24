// getHealth gira server-side (Server Component): usa l'origine interna dell'API.
function apiOrigin() {
  const raw = process.env.API_ORIGIN;
  if (!raw) return 'http://localhost:4000';
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}
const API_URL = apiOrigin();

export type HealthResponse = {
  status: string;
  db: string;
  timestamp: string;
};

/** Chiama l'endpoint /api/health del backend NestJS. */
export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}
