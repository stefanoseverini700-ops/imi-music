// Tipi delle risposte API usati dal frontend.
import type { LeadStatus } from '@imi/shared';

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
}

export interface Artist {
  id: string;
  nome: string;
  citta: string | null;
  genereMusicale: string | null;
  piano: string;
}
