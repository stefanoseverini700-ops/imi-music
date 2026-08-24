import { Injectable, NotFoundException } from '@nestjs/common';
import type { ReleaseStatus as DbStato } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateReleaseDto, UpdateReleaseDto, UpsertLabelCopyDto } from './dto/release.dto.js';

/** Discografia: Release e relativa Label Copy (Sprint 4). */
@Injectable()
export class ReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.release.findMany({
      where: { tenantId },
      orderBy: [{ dataUscita: 'desc' }, { createdAt: 'desc' }],
      include: {
        artist: { select: { id: true, nome: true } },
        labelCopy: true,
      },
    });
  }

  async create(tenantId: string, dto: CreateReleaseDto) {
    const artista = await this.prisma.artist.findFirst({
      where: { id: dto.artistId, tenantId },
    });
    if (!artista) throw new NotFoundException('Artista non trovato');

    return this.prisma.release.create({
      data: {
        tenantId,
        artistId: dto.artistId,
        titolo: dto.titolo,
        dataUscita: dto.dataUscita ? new Date(dto.dataUscita) : null,
        isrc: dto.isrc ?? null,
        genere: dto.genere ?? null,
        ...(dto.explicit !== undefined ? { explicit: dto.explicit } : {}),
        ...(dto.stato ? { stato: dto.stato as DbStato } : {}),
      },
      include: { artist: { select: { id: true, nome: true } }, labelCopy: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateReleaseDto) {
    await this.assertEsiste(tenantId, id);
    return this.prisma.release.update({
      where: { id },
      data: {
        ...(dto.titolo !== undefined ? { titolo: dto.titolo } : {}),
        ...(dto.dataUscita !== undefined ? { dataUscita: new Date(dto.dataUscita) } : {}),
        ...(dto.isrc !== undefined ? { isrc: dto.isrc } : {}),
        ...(dto.genere !== undefined ? { genere: dto.genere } : {}),
        ...(dto.explicit !== undefined ? { explicit: dto.explicit } : {}),
        ...(dto.stato !== undefined ? { stato: dto.stato as DbStato } : {}),
      },
      include: { artist: { select: { id: true, nome: true } }, labelCopy: true },
    });
  }

  /** Crea o aggiorna la Label Copy della release. */
  async upsertLabelCopy(tenantId: string, releaseId: string, dto: UpsertLabelCopyDto) {
    await this.assertEsiste(tenantId, releaseId);
    const dati = {
      autore: dto.autore ?? null,
      compositore: dto.compositore ?? null,
      editori: dto.editori ?? null,
      linkSpotify: dto.linkSpotify ?? null,
      linkTiktok: dto.linkTiktok ?? null,
      startTimeTiktok: dto.startTimeTiktok ?? null,
      bioTerzaPersona: dto.bioTerzaPersona ?? null,
      descrizionePitch: dto.descrizionePitch ?? null,
    };
    return this.prisma.labelCopy.upsert({
      where: { releaseId },
      update: dati,
      create: { releaseId, ...dati },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertEsiste(tenantId, id);
    await this.prisma.release.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async assertEsiste(tenantId: string, id: string) {
    const r = await this.prisma.release.findFirst({ where: { id, tenantId } });
    if (!r) throw new NotFoundException('Release non trovata');
    return r;
  }
}
