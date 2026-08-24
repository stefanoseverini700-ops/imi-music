// Tipi delle risposte API usati dal frontend.
import type { LeadStatus, Role } from '@imi/shared';

export interface IncassiDashboard {
  oggi: number;
  mese: number;
  totale: number;
  perGiorno: { data: string; totale: number }[];
  perMese: { mese: string; totale: number }[];
}

export interface Lead {
  id: string;
  nome: string;
  fonte: string | null;
  stato: LeadStatus;
  valoreStimato: string | null;
  assegnatoA: string | null;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  ruolo: Role;
  dipartimento: string | null;
  stato: string;
}

export interface Artist {
  id: string;
  nome: string;
  citta: string | null;
  genereMusicale: string | null;
  piano: string;
}
