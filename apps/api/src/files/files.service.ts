import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@imi/db';
import type { FileAssetType as DbTipo, FileOwnerType as DbOwnerType } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type { CollegaFileDto, UploadFileDto } from './dto/file.dto.js';

/**
 * Area file condivisa (Sprint 5). `FileAsset` è polimorfico: si aggancia ad
 * artist/task/ticket/release tramite ownerType/ownerId (cfr. ARCHITETTURA.md §5).
 *
 * Storage: i file caricati finiscono su disco (cartella UPLOAD_DIR) e sono
 * serviti da GET /api/files/:id/download. In produzione questo strato va
 * sostituito con object storage S3-compatibile (S3 / Cloudflare R2) — è
 * l'unico punto da cambiare.
 */
@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(user: AuthUser, filtro: { ownerType?: string; ownerId?: string; departmentId?: string }) {
    const where: Prisma.FileAssetWhereInput = { tenantId: user.tenantId };
    if (filtro.ownerType) where.ownerType = filtro.ownerType as DbOwnerType;
    if (filtro.ownerId) where.ownerId = filtro.ownerId;
    if (filtro.departmentId) where.departmentId = filtro.departmentId;

    return this.prisma.fileAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        caricatore: { select: { id: true, nome: true } },
        department: { select: { id: true, nome: true } },
      },
    });
  }

  /** Registra un file caricato su disco. */
  registra(
    user: AuthUser,
    dto: UploadFileDto,
    file: { originalname: string; filename: string; size: number },
  ) {
    return this.prisma.fileAsset.create({
      data: {
        tenantId: user.tenantId,
        ownerType: dto.ownerType as DbOwnerType,
        ownerId: dto.ownerId,
        departmentId: dto.departmentId ?? null,
        nomeFile: file.originalname,
        // `url` contiene il nome del file su disco; il download passa dall'API.
        url: file.filename,
        caricatoDa: user.id,
        ...(dto.tipo ? { tipo: dto.tipo as DbTipo } : {}),
      },
      include: { caricatore: { select: { id: true, nome: true } } },
    });
  }

  /** Registra un file ospitato altrove (Drive, WeTransfer, ...). */
  collega(user: AuthUser, dto: CollegaFileDto) {
    return this.prisma.fileAsset.create({
      data: {
        tenantId: user.tenantId,
        ownerType: dto.ownerType as DbOwnerType,
        ownerId: dto.ownerId,
        departmentId: dto.departmentId ?? null,
        nomeFile: dto.nomeFile,
        url: dto.url,
        caricatoDa: user.id,
        ...(dto.tipo ? { tipo: dto.tipo as DbTipo } : {}),
      },
      include: { caricatore: { select: { id: true, nome: true } } },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const f = await this.prisma.fileAsset.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!f) throw new NotFoundException('File non trovato');
    return f;
  }

  async remove(user: AuthUser, id: string) {
    await this.findOne(user, id);
    await this.prisma.fileAsset.delete({ where: { id } });
    return { id, deleted: true };
  }
}
