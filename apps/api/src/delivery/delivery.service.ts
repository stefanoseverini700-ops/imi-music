import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  DeliveryPlanStatus as DbPianoStato,
  TaskPriority as DbPriorita,
  TaskStatus as DbTaskStato,
} from '@imi/db';
import { Prisma } from '@imi/db';
import { Role } from '@imi/shared';

import { PrismaService } from '../prisma/prisma.service.js';
import { NotificheService } from '../notifiche/notifiche.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type {
  CreatePianoDto,
  CreateStageDto,
  CreateTaskDto,
  UpdatePianoDto,
  UpdateStageDto,
  UpdateTaskDto,
} from './dto/delivery.dto.js';

/**
 * Piani di Delivery (Sprint 4): pipeline dei servizi venduti per artista.
 * L'avanzamento complessivo è la media delle percentuali degli stage.
 */
@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifiche: NotificheService,
  ) {}

  // --- Piani -----------------------------------------------------------------

  async findAllPiani(user: AuthUser) {
    const piani = await this.prisma.deliveryPlan.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        artist: { select: { id: true, nome: true } },
        stages: {
          orderBy: { ordine: 'asc' },
          include: { service: { select: { id: true, nome: true, categoria: true } } },
        },
      },
    });

    return piani.map((p) => ({
      ...p,
      avanzamento:
        p.stages.length > 0
          ? Math.round(p.stages.reduce((s, st) => s + st.percentuale, 0) / p.stages.length)
          : 0,
    }));
  }

  async createPiano(user: AuthUser, dto: CreatePianoDto) {
    const artista = await this.prisma.artist.findFirst({
      where: { id: dto.artistId, tenantId: user.tenantId },
    });
    if (!artista) throw new NotFoundException('Artista non trovato');

    return this.prisma.deliveryPlan.create({
      data: {
        tenantId: user.tenantId,
        artistId: dto.artistId,
        saleId: dto.saleId ?? null,
        ...(dto.stato ? { stato: dto.stato as DbPianoStato } : {}),
      },
      include: { artist: { select: { id: true, nome: true } }, stages: true },
    });
  }

  async updatePiano(user: AuthUser, id: string, dto: UpdatePianoDto) {
    await this.assertPiano(user, id);
    return this.prisma.deliveryPlan.update({
      where: { id },
      data: { stato: dto.stato as DbPianoStato },
    });
  }

  async removePiano(user: AuthUser, id: string) {
    await this.assertPiano(user, id);
    await this.prisma.deliveryPlan.delete({ where: { id } });
    return { id, deleted: true };
  }

  // --- Stage -----------------------------------------------------------------

  async addStage(user: AuthUser, pianoId: string, dto: CreateStageDto) {
    await this.assertPiano(user, pianoId);
    const servizio = await this.prisma.serviceCatalog.findFirst({
      where: { id: dto.serviceId, tenantId: user.tenantId },
    });
    if (!servizio) throw new NotFoundException('Servizio non trovato');

    const ordine =
      dto.ordine ?? (await this.prisma.deliveryStage.count({ where: { deliveryPlanId: pianoId } }));

    return this.prisma.deliveryStage.create({
      data: {
        deliveryPlanId: pianoId,
        serviceId: dto.serviceId,
        percentuale: dto.percentuale ?? 0,
        ordine,
      },
      include: { service: { select: { id: true, nome: true, categoria: true } } },
    });
  }

  async updateStage(user: AuthUser, stageId: string, dto: UpdateStageDto) {
    const stage = await this.prisma.deliveryStage.findFirst({
      where: { id: stageId, deliveryPlan: { tenantId: user.tenantId } },
    });
    if (!stage) throw new NotFoundException('Fase non trovata');
    return this.prisma.deliveryStage.update({
      where: { id: stageId },
      data: { percentuale: dto.percentuale },
    });
  }

  async removeStage(user: AuthUser, stageId: string) {
    const stage = await this.prisma.deliveryStage.findFirst({
      where: { id: stageId, deliveryPlan: { tenantId: user.tenantId } },
    });
    if (!stage) throw new NotFoundException('Fase non trovata');
    await this.prisma.deliveryStage.delete({ where: { id: stageId } });
    return { id: stageId, deleted: true };
  }

  // --- Task ------------------------------------------------------------------

  /** Gli Operatori vedono solo i task assegnati a loro; Admin vede tutto. */
  private scopeTask(user: AuthUser): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = { tenantId: user.tenantId };
    if (user.ruolo === Role.OPERATORE) where.assegnatoA = user.id;
    return where;
  }

  findAllTask(user: AuthUser) {
    return this.prisma.task.findMany({
      where: this.scopeTask(user),
      orderBy: [{ stato: 'asc' }, { scadenza: 'asc' }],
      include: { assegnato: { select: { id: true, nome: true } } },
    });
  }

  async createTask(user: AuthUser, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        tenantId: user.tenantId,
        titolo: dto.titolo,
        descrizione: dto.descrizione ?? null,
        deliveryStageId: dto.deliveryStageId ?? null,
        assegnatoA: dto.assegnatoA ?? null,
        scadenza: dto.scadenza ? new Date(dto.scadenza) : null,
        ...(dto.priorita ? { priorita: dto.priorita as DbPriorita } : {}),
      },
      include: { assegnato: { select: { id: true, nome: true } } },
    });

    if (dto.assegnatoA && dto.assegnatoA !== user.id) {
      await this.notifiche.notifica(
        user.tenantId,
        dto.assegnatoA,
        'TASK',
        `Ti è stato assegnato il task "${task.titolo}".`,
        `Nuovo task: ${task.titolo}`,
      );
    }
    return task;
  }

  async updateTask(user: AuthUser, id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({ where: { id, ...this.scopeTask(user) } });
    if (!task) throw new NotFoundException('Task non trovato');
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.stato !== undefined ? { stato: dto.stato as DbTaskStato } : {}),
        ...(dto.priorita !== undefined ? { priorita: dto.priorita as DbPriorita } : {}),
        ...(dto.assegnatoA !== undefined ? { assegnatoA: dto.assegnatoA } : {}),
      },
      include: { assegnato: { select: { id: true, nome: true } } },
    });
  }

  async removeTask(user: AuthUser, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!task) throw new NotFoundException('Task non trovato');
    await this.prisma.task.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async assertPiano(user: AuthUser, id: string) {
    const piano = await this.prisma.deliveryPlan.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!piano) throw new NotFoundException('Piano di delivery non trovato');
    return piano;
  }
}
