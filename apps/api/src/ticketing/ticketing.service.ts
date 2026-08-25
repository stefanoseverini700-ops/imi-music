import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@imi/db';
import type { TicketPriority as DbPriorita, TicketStatus as DbStato } from '@imi/db';
import { Role } from '@imi/shared';

import { PrismaService } from '../prisma/prisma.service.js';
import { NotificheService } from '../notifiche/notifiche.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type {
  CreateDipartimentoDto,
  CreateMessaggioDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/ticketing.dto.js';

/**
 * Ticketing interno per dipartimento (Sprint 5).
 * Isolamento a livello di riga: l'Admin vede tutto; gli Operatori vedono i
 * ticket del proprio dipartimento (o assegnati a loro); gli Artisti solo i propri.
 */
@Injectable()
export class TicketingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifiche: NotificheService,
  ) {}

  // --- Dipartimenti ---

  findAllDipartimenti(tenantId: string) {
    return this.prisma.department.findMany({ where: { tenantId }, orderBy: { nome: 'asc' } });
  }

  createDipartimento(tenantId: string, dto: CreateDipartimentoDto) {
    return this.prisma.department.create({ data: { tenantId, nome: dto.nome } });
  }

  async removeDipartimento(tenantId: string, id: string) {
    const d = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!d) throw new NotFoundException('Dipartimento non trovato');
    await this.prisma.department.delete({ where: { id } });
    return { id, deleted: true };
  }

  // --- Ticket ---

  private async scope(user: AuthUser): Promise<Prisma.TicketWhereInput> {
    const where: Prisma.TicketWhereInput = { tenantId: user.tenantId };
    if (user.ruolo === Role.ADMIN) return where;

    if (user.ruolo === Role.ARTISTA) {
      // L'artista vede solo i ticket che ha aperto lui.
      return { ...where, creatoDa: user.id };
    }

    // Operatori/Sales: ticket del proprio dipartimento, creati da loro o assegnati.
    const utente = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { dipartimento: true },
    });
    const nomeDip = utente?.dipartimento ?? null;
    return {
      ...where,
      OR: [
        { creatoDa: user.id },
        { assegnatoA: user.id },
        ...(nomeDip ? [{ department: { nome: nomeDip } }] : []),
      ],
    };
  }

  async findAll(user: AuthUser) {
    return this.prisma.ticket.findMany({
      where: await this.scope(user),
      orderBy: [{ stato: 'asc' }, { createdAt: 'desc' }],
      include: {
        department: { select: { id: true, nome: true } },
        creatore: { select: { id: true, nome: true } },
        assegnato: { select: { id: true, nome: true } },
        artist: { select: { id: true, nome: true } },
        _count: { select: { messages: true } },
      },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, ...(await this.scope(user)) },
      include: {
        department: { select: { id: true, nome: true } },
        creatore: { select: { id: true, nome: true } },
        assegnato: { select: { id: true, nome: true } },
        artist: { select: { id: true, nome: true } },
        messages: {
          orderBy: { creatoIl: 'asc' },
          include: { autore: { select: { id: true, nome: true } } },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket non trovato');
    return ticket;
  }

  /** Crea il ticket con il primo messaggio; SLA a 48h dalla creazione. */
  async create(user: AuthUser, dto: CreateTicketDto) {
    const sla = new Date();
    sla.setHours(sla.getHours() + 48);

    return this.prisma.ticket.create({
      data: {
        tenantId: user.tenantId,
        oggetto: dto.oggetto,
        departmentId: dto.departmentId ?? null,
        artistId: dto.artistId ?? null,
        creatoDa: user.id,
        slaScadenza: sla,
        ...(dto.priorita ? { priorita: dto.priorita as DbPriorita } : {}),
        messages: { create: { autoreId: user.id, testo: dto.messaggio } },
      },
      include: {
        department: { select: { id: true, nome: true } },
        creatore: { select: { id: true, nome: true } },
        _count: { select: { messages: true } },
      },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateTicketDto) {
    await this.findOne(user, id);
    // Gli Artisti non gestiscono stato/assegnazione dei ticket.
    if (user.ruolo === Role.ARTISTA) {
      throw new ForbiddenException('Operazione non consentita');
    }
    const aggiornato = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.stato !== undefined ? { stato: dto.stato as DbStato } : {}),
        ...(dto.priorita !== undefined ? { priorita: dto.priorita as DbPriorita } : {}),
        ...(dto.assegnatoA !== undefined ? { assegnatoA: dto.assegnatoA } : {}),
        ...(dto.departmentId !== undefined ? { departmentId: dto.departmentId } : {}),
      },
      include: {
        department: { select: { id: true, nome: true } },
        assegnato: { select: { id: true, nome: true } },
      },
    });

    if (dto.assegnatoA && dto.assegnatoA !== user.id) {
      await this.notifiche.notifica(
        user.tenantId,
        dto.assegnatoA,
        'TICKET',
        `Ti è stato assegnato il ticket "${aggiornato.oggetto}".`,
        `Ticket assegnato: ${aggiornato.oggetto}`,
      );
    }
    return aggiornato;
  }

  async addMessaggio(user: AuthUser, ticketId: string, dto: CreateMessaggioDto) {
    const ticket = await this.findOne(user, ticketId);
    const messaggio = await this.prisma.ticketMessage.create({
      data: { ticketId, autoreId: user.id, testo: dto.testo },
      include: { autore: { select: { id: true, nome: true } } },
    });

    // Avvisa l'altra parte: l'assegnatario, altrimenti chi ha aperto il ticket.
    const destinatario =
      ticket.assegnatoA && ticket.assegnatoA !== user.id
        ? ticket.assegnatoA
        : ticket.creatoDa !== user.id
          ? ticket.creatoDa
          : null;
    if (destinatario) {
      await this.notifiche.notifica(
        user.tenantId,
        destinatario,
        'TICKET',
        `Nuovo messaggio sul ticket "${ticket.oggetto}".`,
        `Ticket: ${ticket.oggetto}`,
      );
    }
    return messaggio;
  }

  async remove(user: AuthUser, id: string) {
    const t = await this.prisma.ticket.findFirst({ where: { id, tenantId: user.tenantId } });
    if (!t) throw new NotFoundException('Ticket non trovato');
    await this.prisma.ticket.delete({ where: { id } });
    return { id, deleted: true };
  }
}
