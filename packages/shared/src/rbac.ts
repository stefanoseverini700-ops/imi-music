/**
 * RBAC a due livelli (cfr. ARCHITETTURA.md §3):
 *  1. Ruolo macro  → routing / autenticazione
 *  2. Permesso di modulo → righe/colonne visibili
 *
 * Tenere i due livelli separati permette di introdurre in futuro sotto-ruoli
 * (Setter/Closer, Finance, HR, BDM) senza reinventare l'RBAC.
 */

/** Ruolo macro dell'utente. */
export enum Role {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  OPERATORE = 'OPERATORE',
  ARTISTA = 'ARTISTA',
}

/** Moduli funzionali su cui si concedono permessi. */
export enum ModuleKey {
  SALES = 'SALES',
  DELIVERY = 'DELIVERY',
  TICKETING = 'TICKETING',
  BOOKING = 'BOOKING',
  FINANCE = 'FINANCE',
  HR = 'HR',
  AUDIT = 'AUDIT',
}

/** Azioni concedibili su un modulo. */
export enum PermissionAction {
  READ = 'READ',
  WRITE = 'WRITE',
  MANAGE = 'MANAGE',
}

export type ModulePermissions = Partial<Record<ModuleKey, PermissionAction[]>>;

const R = PermissionAction.READ;
const W = PermissionAction.WRITE;
const M = PermissionAction.MANAGE;

/**
 * Matrice permessi di default per ruolo macro.
 * Isolamento rigido: ciò che non è elencato non è accessibile.
 */
export const DEFAULT_PERMISSIONS: Record<Role, ModulePermissions> = {
  [Role.ADMIN]: {
    [ModuleKey.SALES]: [R, W, M],
    [ModuleKey.DELIVERY]: [R, W, M],
    [ModuleKey.TICKETING]: [R, W, M],
    [ModuleKey.BOOKING]: [R, W, M],
    [ModuleKey.FINANCE]: [R, W, M],
    [ModuleKey.HR]: [R, W, M],
    [ModuleKey.AUDIT]: [R, W, M],
  },
  // Sales: lead, pipeline, calendario, KPI personali. Nessun accesso a delivery/ticket.
  [Role.SALES]: {
    [ModuleKey.SALES]: [R, W],
  },
  // Operatori (producer, videomaker, grafici, SMM): task e ticket del proprio dipartimento.
  [Role.OPERATORE]: {
    [ModuleKey.DELIVERY]: [R, W],
    [ModuleKey.TICKETING]: [R, W],
  },
  // Artisti/Clienti: dashboard personale in sola lettura + ticket propri.
  [Role.ARTISTA]: {
    [ModuleKey.DELIVERY]: [R],
    [ModuleKey.TICKETING]: [R, W],
  },
};

/** Verifica se un ruolo dispone di una data azione su un modulo. */
export function can(role: Role, module: ModuleKey, action: PermissionAction): boolean {
  const actions = DEFAULT_PERMISSIONS[role]?.[module];
  if (!actions) return false;
  if (actions.includes(PermissionAction.MANAGE)) return true;
  return actions.includes(action);
}
