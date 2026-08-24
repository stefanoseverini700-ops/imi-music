import { Module } from '@nestjs/common';

import { DeliveryService } from './delivery.service.js';
import { DeliveryController } from './delivery.controller.js';

/** Dominio Delivery (Sprint 4): piani, fasi con avanzamento, task. */
@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
