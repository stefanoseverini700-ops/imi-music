import { Module } from '@nestjs/common';

import { TicketingService } from './ticketing.service.js';
import { TicketingController } from './ticketing.controller.js';

/** Dominio Ticketing (Sprint 5): dipartimenti, ticket, messaggi. */
@Module({
  controllers: [TicketingController],
  providers: [TicketingService],
  exports: [TicketingService],
})
export class TicketingModule {}
