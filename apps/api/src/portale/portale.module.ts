import { Module } from '@nestjs/common';

import { PortaleService } from './portale.service.js';
import { PortaleController } from './portale.controller.js';

/** Portale artista (Sprint 6). */
@Module({
  controllers: [PortaleController],
  providers: [PortaleService],
  exports: [PortaleService],
})
export class PortaleModule {}
