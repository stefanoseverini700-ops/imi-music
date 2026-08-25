'use client';

// Vuoto = chiamate same-origin (/api/...), inoltrate all'API dal proxy di Next
// (vedi next.config.mjs → rewrites). Evita problemi di CORS in produzione.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const ACCESS_KEY = 'imi_access';
const REFRESH_KEY = 'imi_refresh';

export function getToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

function setTokens(access: string, refresh: string) {
  try {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  } catch {
    /* storage non disponibile */
  }
}

export function logout() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* no-op */
  }
}

/** Ruolo dell'utente autenticato, letto dal payload del token. */
export function ruoloCorrente(): string | null {
  const t = getToken();
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1] ?? '')) as { ruolo?: string };
    return payload.ruolo ?? null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error('Credenziali non valide');
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
}

/** Chiamata autenticata con Bearer token; estrae il messaggio d'errore dell'API. */
async function authFetch<T>(path: string, method: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    let msg = `Errore ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data?.message) {
        msg = Array.isArray(data.message) ? data.message.join(' · ') : String(data.message);
      }
    } catch {
      /* corpo non-JSON */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export function authGet<T>(path: string): Promise<T> {
  return authFetch<T>(path, 'GET');
}

export function authPost<T>(path: string, body: unknown): Promise<T> {
  return authFetch<T>(path, 'POST', body);
}

export function authPatch<T>(path: string, body: unknown): Promise<T> {
  return authFetch<T>(path, 'PATCH', body);
}

export function authPut<T>(path: string, body: unknown): Promise<T> {
  return authFetch<T>(path, 'PUT', body);
}

export function authDelete<T>(path: string): Promise<T> {
  return authFetch<T>(path, 'DELETE');
}

/** Upload di un file con metadati (multipart/form-data). */
export async function authUpload<T>(path: string, form: FormData): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    // Nessun Content-Type: lo imposta il browser con il boundary corretto.
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) {
    let msg = `Errore ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data?.message) {
        msg = Array.isArray(data.message) ? data.message.join(' · ') : String(data.message);
      }
    } catch {
      /* corpo non-JSON */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

/** URL di download di un file (passa dall'API, che applica i permessi). */
export function urlDownload(id: string): string {
  return `${API_URL}/api/files/${id}/download`;
}
