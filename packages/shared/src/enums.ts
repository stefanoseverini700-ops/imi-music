/**
 * Enum di dominio condivisi tra API e Web.
 * Rispecchiano gli enum dello schema Prisma (packages/db) e dell'ER in ARCHITETTURA.md §5.
 */

export enum UserStatus {
  ATTIVO = 'ATTIVO',
  SOSPESO = 'SOSPESO',
  DISATTIVATO = 'DISATTIVATO',
}

export enum ArtistPlan {
  BASE = 'BASE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export enum LeadStatus {
  NUOVO = 'NUOVO',
  QUALIFICATO = 'QUALIFICATO',
  IN_TRATTATIVA = 'IN_TRATTATIVA',
  VINTO = 'VINTO',
  PERSO = 'PERSO',
}

export enum PaymentStatus {
  IN_ATTESA = 'IN_ATTESA',
  PARZIALE = 'PARZIALE',
  PAGATO = 'PAGATO',
  RIMBORSATO = 'RIMBORSATO',
}

/** Categorie del catalogo servizi (pipeline Delivery, cfr. pattern "Caronte"). */
export enum ServiceCategory {
  DISTRIBUZIONE = 'DISTRIBUZIONE',
  MANAGEMENT = 'MANAGEMENT',
  ADVERTISING_PROMO = 'ADVERTISING_PROMO',
  PITCH_PR = 'PITCH_PR',
  LIVE = 'LIVE',
  BRANDING = 'BRANDING',
}

export enum DeliveryPlanStatus {
  BOZZA = 'BOZZA',
  ATTIVO = 'ATTIVO',
  COMPLETATO = 'COMPLETATO',
  SOSPESO = 'SOSPESO',
}

export enum TaskStatus {
  DA_FARE = 'DA_FARE',
  IN_CORSO = 'IN_CORSO',
  IN_REVISIONE = 'IN_REVISIONE',
  COMPLETATO = 'COMPLETATO',
}

export enum TaskPriority {
  BASSA = 'BASSA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum ConsultationType {
  GRUPPO = 'GRUPPO',
  INDIVIDUALE = 'INDIVIDUALE',
}

export enum ConsultationOutcome {
  SVOLTA = 'SVOLTA',
  NO_SHOW = 'NO_SHOW',
  RIMANDATA = 'RIMANDATA',
}

export enum TicketStatus {
  APERTO = 'APERTO',
  IN_LAVORAZIONE = 'IN_LAVORAZIONE',
  IN_ATTESA = 'IN_ATTESA',
  RISOLTO = 'RISOLTO',
  CHIUSO = 'CHIUSO',
}

export enum TicketPriority {
  BASSA = 'BASSA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

/** FILE_ASSET è polimorfico: si aggancia a diverse entità (cfr. ER §5). */
export enum FileOwnerType {
  ARTIST = 'ARTIST',
  TASK = 'TASK',
  TICKET = 'TICKET',
  RELEASE = 'RELEASE',
}

export enum FileAssetType {
  MASTER_AUDIO = 'MASTER_AUDIO',
  COPERTINA = 'COPERTINA',
  VIDEO = 'VIDEO',
  GRAFICA = 'GRAFICA',
  DOCUMENTO = 'DOCUMENTO',
  ALTRO = 'ALTRO',
}

export enum EventStatus {
  PROPOSTO = 'PROPOSTO',
  ACCETTATO = 'ACCETTATO',
  RIFIUTATO = 'RIFIUTATO',
}

export enum ReleaseStatus {
  BOZZA = 'BOZZA',
  IN_LAVORAZIONE = 'IN_LAVORAZIONE',
  PROGRAMMATA = 'PROGRAMMATA',
  PUBBLICATA = 'PUBBLICATA',
}

export enum NotificationType {
  SCADENZA = 'SCADENZA',
  TASK = 'TASK',
  TICKET = 'TICKET',
  SISTEMA = 'SISTEMA',
}
