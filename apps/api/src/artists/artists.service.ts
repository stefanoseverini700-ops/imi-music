import { Injectable, NotFoundException } from '@nestjs/common';
import type { ArtistPlan as DbArtistPlan } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateArtistDto } from './dto/create-artist.dto.js';
import type { UpdateArtistDto } from './dto/update-artist.dto.js';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateArtistDto) {
    return this.prisma.artist.create({
      data: {
        tenantId,
        nome: dto.nome,
        citta: dto.citta ?? null,
        lat: dto.lat ?? null,
        lng: dto.lng ?? null,
        genereMusicale: dto.genereMusicale ?? null,
        userId: dto.userId ?? null,
        // Prisma e @imi/shared definiscono `ArtistPlan` con gli stessi valori ma
        // tipi nominalmente distinti: cast sicuro al confine col DB.
        ...(dto.piano ? { piano: dto.piano as DbArtistPlan } : {}),
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.artist.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const artist = await this.prisma.artist.findFirst({ where: { id, tenantId } });
    if (!artist) throw new NotFoundException('Artista non trovato');
    return artist;
  }

  async update(tenantId: string, id: string, dto: UpdateArtistDto) {
    // Garantisce l'isolamento per tenant prima di aggiornare.
    await this.findOne(tenantId, id);
    return this.prisma.artist.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.citta !== undefined ? { citta: dto.citta } : {}),
        ...(dto.lat !== undefined ? { lat: dto.lat } : {}),
        ...(dto.lng !== undefined ? { lng: dto.lng } : {}),
        ...(dto.genereMusicale !== undefined ? { genereMusicale: dto.genereMusicale } : {}),
        ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
        ...(dto.piano !== undefined ? { piano: dto.piano as DbArtistPlan } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.artist.delete({ where: { id } });
    return { id, deleted: true };
  }
}
