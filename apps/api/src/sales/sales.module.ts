import { Module } from '@nestjs/common';

import { SalesService } from './sales.service.js';
import { SalesController } from './sales.controller.js';

/**
 * Dominio Sales (Sprint 2): registrazione vendite e cruscotto incassi.
 * La pipeline lead (kanban) è nel modulo Leads.
 */
@Module({
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
