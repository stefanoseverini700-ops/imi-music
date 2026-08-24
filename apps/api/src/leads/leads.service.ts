import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type LeadStatus as DbLeadStatus } from '@imi/db';
import { Role } from '@imi/shared';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type { CreateLeadDto } from './dto/create-lead.dto.js';
import type { UpdateLeadDto } from './dto/update-lead.dto.js';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Visibilità: l'Admin vede tutti i lead del tenant, i Sales solo i propri
   * (isolamento a livello di riga — livello 2 dell'RBAC).
   */
  private scope(user: AuthUser): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = { tenantId: user.tenantId };
    if (user.ruolo === Role.SALES) {
      where.assegnatoA = user.id;
    }
    return where;
  }

  create(user: AuthUser, dto: CreateLeadDto) {
    // I Sales possono creare lead solo su di sé; l'Admin può assegnare a chiunque.
    const assegnatoA = user.ruolo === Role.SALES ? user.id : (dto.assegnatoA ?? null);
    return this.prisma.lead.create({
      data: {
        tenantId: user.tenantId,
        nome: dto.nome,
        fonte: dto.fonte ?? null,
        valoreStimato: dto.valoreStimato ?? null,
        assegnatoA,
        ...(dto.stato ? { stato: dto.stato as DbLeadStatus } : {}),
      },
    });
  }

  findAll(user: AuthUser, stato?: DbLeadStatus) {
    return this.prisma.lead.findMany({
      where: { ...this.scope(user), ...(stato ? { stato } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, ...this.scope(user) } });
    if (!lead) throw new NotFoundException('Lead non trovato');
    return lead;
  }

  async update(user: AuthUser, id: string, dto: UpdateLeadDto) {
    await this.findOne(user, id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.fonte !== undefined ? { fonte: dto.fonte } : {}),
        ...(dto.valoreStimato !== undefined ? { valoreStimato: dto.valoreStimato } : {}),
        ...(dto.stato !== undefined ? { stato: dto.stato as DbLeadStatus } : {}),
      },
    });
  }

  async changeStatus(user: AuthUser, id: string, stato: DbLeadStatus) {
    await this.findOne(user, id);
    return this.prisma.lead.update({ where: { id }, data: { stato } });
  }

  /** Assegnazione lead — solo Admin (validato nel controller). */
  async assign(user: AuthUser, id: string, assegnatoA: string) {
    await this.findOne(user, id);
    return this.prisma.lead.update({ where: { id }, data: { assegnatoA } });
  }

  async remove(user: AuthUser, id: string) {
    await this.findOne(user, id);
    await this.prisma.lead.delete({ where: { id } });
    return { id, deleted: true };
  }
}
