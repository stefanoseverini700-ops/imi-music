import { Injectable, NotFoundException } from '@nestjs/common';
import type { ServiceCategory as DbCategoria } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateServizioDto, UpdateServizioDto } from './dto/create-servizio.dto.js';

/** Catalogo servizi vendibili (Sprint 4). */
@Injectable()
export class ServiziService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.serviceCatalog.findMany({
      where: { tenantId },
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    });
  }

  create(tenantId: string, dto: CreateServizioDto) {
    return this.prisma.serviceCatalog.create({
      data: {
        tenantId,
        nome: dto.nome,
        categoria: dto.categoria as DbCategoria,
        prezzoBase: dto.prezzoBase,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateServizioDto) {
    await this.assertEsiste(tenantId, id);
    return this.prisma.serviceCatalog.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.categoria !== undefined ? { categoria: dto.categoria as DbCategoria } : {}),
        ...(dto.prezzoBase !== undefined ? { prezzoBase: dto.prezzoBase } : {}),
        ...(dto.attivo !== undefined ? { attivo: dto.attivo } : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertEsiste(tenantId, id);
    // Disattivazione logica: il servizio può essere referenziato da vendite/stage.
    await this.prisma.serviceCatalog.update({ where: { id }, data: { attivo: false } });
    return { id, disattivato: true };
  }

  private async assertEsiste(tenantId: string, id: string) {
    const s = await this.prisma.serviceCatalog.findFirst({ where: { id, tenantId } });
    if (!s) throw new NotFoundException('Servizio non trovato');
    return s;
  }
}
