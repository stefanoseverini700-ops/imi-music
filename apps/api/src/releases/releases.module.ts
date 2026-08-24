import { Module } from '@nestjs/common';

import { ReleasesService } from './releases.service.js';
import { ReleasesController } from './releases.controller.js';

@Module({
  controllers: [ReleasesController],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
