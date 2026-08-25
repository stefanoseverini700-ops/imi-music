import { Controller, Get } from '@nestjs/common';

import { Public } from '../common/rbac/public.decorator.js';

/**
 * Informazioni sull'ambiente utili al frontend (Sprint 6).
 * Pubblico e volutamente minimale: nessun dato sensibile.
 */
@Controller('config')
export class ConfigController {
  @Public()
  @Get()
  config() {
    // Finché non è configurato un object storage S3/R2, i file caricati stanno
    // sul disco del servizio: in hosting su piano free è effimero.
    const storagePersistente = Boolean(process.env.S3_BUCKET);
    return {
      storagePersistente,
      // In produzione senza storage persistente il team va avvisato.
      avvisoFileTemporanei: process.env.NODE_ENV === 'production' && !storagePersistente,
    };
  }
}
