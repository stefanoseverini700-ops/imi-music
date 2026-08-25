// Tipi delle risposte API usati dal frontend.
import type {
  AppuntamentoTipo,
  FileAssetType,
  FileOwnerType,
  TicketPriority,
  TicketStatus,
  DeliveryPlanStatus,
  LeadStatus,
  ReleaseStatus,
  Role,
  ServiceCategory,
  TaskPriority,
  TaskStatus,
} from '@imi/shared';

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

export interface KpiVenditore {
  venditoreId: string | null;
  nome: string;
  numeroVendite: number;
  totale: number;
  totaleMese: number;
  ticketMedio: number;
}

export interface Appuntamento {
  id: string;
  titolo: string;
  inizio: string;
  tipo: AppuntamentoTipo;
  note: string | null;
  user: { id: string; nome: string } | null;
}

export interface Feedback {
  id: string;
  testo: string;
  createdAt: string;
  autore: { id: string; nome: string } | null;
}

export interface Servizio {
  id: string;
  nome: string;
  categoria: ServiceCategory;
  prezzoBase: string;
  attivo: boolean;
}

export interface DeliveryStage {
  id: string;
  percentuale: number;
  ordine: number;
  service: { id: string; nome: string; categoria: ServiceCategory };
}

export interface DeliveryPiano {
  id: string;
  stato: DeliveryPlanStatus;
  avanzamento: number;
  artist: { id: string; nome: string };
  stages: DeliveryStage[];
}

export interface Task {
  id: string;
  titolo: string;
  descrizione: string | null;
  stato: TaskStatus;
  priorita: TaskPriority;
  scadenza: string | null;
  assegnato: { id: string; nome: string } | null;
}

export interface LabelCopy {
  autore: string | null;
  compositore: string | null;
  editori: string | null;
  linkSpotify: string | null;
  linkTiktok: string | null;
  startTimeTiktok: string | null;
  bioTerzaPersona: string | null;
  descrizionePitch: string | null;
}

export interface Release {
  id: string;
  titolo: string;
  dataUscita: string | null;
  isrc: string | null;
  genere: string | null;
  explicit: boolean;
  stato: ReleaseStatus;
  artist: { id: string; nome: string };
  labelCopy: LabelCopy | null;
}

export interface Artist {
  id: string;
  nome: string;
  citta: string | null;
  genereMusicale: string | null;
  piano: string;
}

export interface Dipartimento {
  id: string;
  nome: string;
}

export interface Ticket {
  id: string;
  oggetto: string;
  stato: TicketStatus;
  priorita: TicketPriority;
  slaScadenza: string | null;
  createdAt: string;
  department: { id: string; nome: string } | null;
  creatore: { id: string; nome: string } | null;
  assegnato: { id: string; nome: string } | null;
  artist: { id: string; nome: string } | null;
  _count?: { messages: number };
}

export interface TicketMessaggio {
  id: string;
  testo: string;
  creatoIl: string;
  autore: { id: string; nome: string } | null;
}

export interface TicketDettaglio extends Ticket {
  messages: TicketMessaggio[];
}

export interface FileAsset {
  id: string;
  nomeFile: string;
  url: string;
  tipo: FileAssetType;
  ownerType: FileOwnerType;
  ownerId: string;
  versione: number;
  createdAt: string;
  caricatore: { id: string; nome: string } | null;
  department: { id: string; nome: string } | null;
}

export interface Notifica {
  id: string;
  tipo: string;
  testo: string | null;
  letto: boolean;
  createdAt: string;
}

export interface PortalePiano {
  id: string;
  stato: string;
  avanzamento: number;
  fasi: { id: string; nome: string; categoria: string; percentuale: number }[];
}

export interface PortaleEvento {
  id: string;
  data: string;
  stato: string;
  venue: { nome: string; citta: string | null } | null;
}

export interface PortalePanoramica {
  artista: {
    id: string;
    nome: string;
    citta: string | null;
    genereMusicale: string | null;
    piano: string;
  };
  piani: PortalePiano[];
  releases: Release[];
  files: FileAsset[];
  tickets: Ticket[];
  eventi: PortaleEvento[];
}
