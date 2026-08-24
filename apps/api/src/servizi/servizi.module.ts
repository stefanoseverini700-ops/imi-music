import { Module } from '@nestjs/common';

import { ServiziService } from './servizi.service.js';
import { ServiziController } from './servizi.controller.js';

@Module({
  controllers: [ServiziController],
  providers: [ServiziService],
  exports: [ServiziService],
})
export class ServiziModule {}
