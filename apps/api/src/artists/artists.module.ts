import { Module } from '@nestjs/common';

import { ArtistsService } from './artists.service.js';
import { ArtistsController } from './artists.controller.js';

@Module({
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
