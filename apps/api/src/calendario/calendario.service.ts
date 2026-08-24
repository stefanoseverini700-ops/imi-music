import { Injectable, NotFoundException } from '@nestjs/common';
import type { AppuntamentoTipo as DbTipo } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type { CreateAppuntamentoDto } from './dto/create-appuntamento.dto.js';

@Injectable()
export class CalendarioService {
  constructor(private readonly prisma: PrismaService) {}

  /** Calendario condiviso del tenant: tutto lo staff vede le stesse voci. */
  findAll(user: AuthUser) {
    return this.prisma.appuntamento.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { inizio: 'asc' },
      include: { user: { select: { id: true, nome: true } } },
    });
  }

  create(user: AuthUser, dto: CreateAppuntamentoDto) {
    return this.prisma.appuntamento.create({
      data: {
        tenantId: user.tenantId,
        titolo: dto.titolo,
        inizio: new Date(dto.inizio),
        userId: dto.userId ?? user.id,
        note: dto.note ?? null,
        ...(dto.tipo ? { tipo: dto.tipo as DbTipo } : {}),
      },
      include: { user: { select: { id: true, nome: true } } },
    });
  }

  async remove(user: AuthUser, id: string) {
    const voce = await this.prisma.appuntamento.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!voce) throw new NotFoundException('Appuntamento non trovato');
    await this.prisma.appuntamento.delete({ where: { id } });
    return { id, deleted: true };
  }
}
