import { Module } from '@nestjs/common';

import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';

/** Area file condivisa (Sprint 5). */
@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
