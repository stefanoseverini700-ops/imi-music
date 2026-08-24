const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
