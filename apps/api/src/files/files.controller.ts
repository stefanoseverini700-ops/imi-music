import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { FilesService } from './files.service.js';
import { CollegaFileDto, UploadFileDto } from './dto/file.dto.js';

/** Cartella di destinazione degli upload (sostituibile con S3/R2 in produzione). */
export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR ?? './uploads');

@Roles(Role.ADMIN, Role.OPERATORE, Role.SALES)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('ownerType') ownerType?: string,
    @Query('ownerId') ownerId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.files.findAll(user, { ownerType, ownerId, departmentId });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
          cb(null, UPLOAD_DIR);
        },
        // Nome su disco casuale: evita collisioni e path traversal.
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Body() dto: UploadFileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nessun file ricevuto');
    return this.files.registra(user, dto, file);
  }

  /** Registra un file ospitato altrove (link esterno). */
  @Post('collega')
  collega(@CurrentUser() user: AuthUser, @Body() dto: CollegaFileDto) {
    return this.files.collega(user, dto);
  }

  @Get(':id/download')
  async download(@CurrentUser() user: AuthUser, @Param('id') id: string, @Res() res: Response) {
    const asset = await this.files.findOne(user, id);
    // I link esterni non transitano dal disco.
    if (/^https?:\/\//i.test(asset.url)) {
      return res.redirect(asset.url);
    }
    const percorso = join(UPLOAD_DIR, asset.url);
    if (!percorso.startsWith(UPLOAD_DIR) || !existsSync(percorso)) {
      throw new NotFoundException('File non disponibile sul server');
    }
    return res.download(percorso, asset.nomeFile);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.files.remove(user, id);
  }
}
