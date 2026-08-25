import { Injectable, Logger } from '@nestjs/common';

/**
 * Invio email transazionali (Sprint 6).
 *
 * Se `RESEND_API_KEY` è configurata invia davvero via Resend; altrimenti
 * registra il messaggio nei log — così in sviluppo tutto funziona senza
 * credenziali e in produzione basta impostare la variabile d'ambiente.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private get apiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  private get mittente(): string {
    return process.env.EMAIL_FROM ?? 'IMI Music <onboarding@resend.dev>';
  }

  async invia(destinatario: string, oggetto: string, testo: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.log(`[email non inviata: RESEND_API_KEY assente] a ${destinatario}: ${oggetto}`);
      return false;
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.mittente,
          to: [destinatario],
          subject: oggetto,
          text: testo,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Invio email fallito (${res.status}) a ${destinatario}`);
        return false;
      }
      return true;
    } catch (e) {
      // Un problema di rete non deve mai far fallire l'operazione applicativa.
      this.logger.warn(`Errore invio email a ${destinatario}: ${(e as Error).message}`);
      return false;
    }
  }
}
