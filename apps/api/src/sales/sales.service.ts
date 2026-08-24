import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type PaymentStatus as DbPaymentStatus } from '@imi/db';
import { Role } from '@imi/shared';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import type { CreateSaleDto } from './dto/create-sale.dto.js';

/** Converte un Decimal Prisma (o null) in number. */
function dec(value: Prisma.Decimal | null): number {
  return value ? Number(value) : 0;
}

export interface IncassiDashboard {
  oggi: number;
  mese: number;
  totale: number;
  perGiorno: { data: string; totale: number }[];
  perMese: { mese: string; totale: number }[];
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Admin vede tutte le vendite del tenant; i Sales solo le proprie. */
  private scope(user: AuthUser): Prisma.SaleWhereInput {
    const where: Prisma.SaleWhereInput = { tenantId: user.tenantId };
    if (user.ruolo === Role.SALES) {
      where.venditoreId = user.id;
    }
    return where;
  }

  create(user: AuthUser, dto: CreateSaleDto) {
    const venditoreId = user.ruolo === Role.SALES ? user.id : (dto.venditoreId ?? user.id);
    return this.prisma.sale.create({
      data: {
        tenantId: user.tenantId,
        artistId: dto.artistId,
        leadId: dto.leadId ?? null,
        venditoreId,
        importo: dto.importo,
        ...(dto.statoPagamento ? { statoPagamento: dto.statoPagamento as DbPaymentStatus } : {}),
        ...(dto.data ? { data: new Date(dto.data) } : {}),
      },
    });
  }

  findAll(user: AuthUser) {
    return this.prisma.sale.findMany({
      where: this.scope(user),
      orderBy: { data: 'desc' },
    });
  }

  async findOne(user: AuthUser, id: string) {
    const sale = await this.prisma.sale.findFirst({ where: { id, ...this.scope(user) } });
    if (!sale) throw new NotFoundException('Vendita non trovata');
    return sale;
  }

  /** Cruscotto incassi giornaliero/mensile (cfr. ARCHITETTURA.md §6, Sprint 2). */
  async dashboardIncassi(user: AuthUser): Promise<IncassiDashboard> {
    const scope = this.scope(user);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start12mAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [oggiAgg, meseAgg, totaleAgg, rows] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { ...scope, data: { gte: startOfToday } },
        _sum: { importo: true },
      }),
      this.prisma.sale.aggregate({
        where: { ...scope, data: { gte: startOfMonth } },
        _sum: { importo: true },
      }),
      this.prisma.sale.aggregate({ where: scope, _sum: { importo: true } }),
      this.prisma.sale.findMany({
        where: { ...scope, data: { gte: start12mAgo } },
        select: { importo: true, data: true },
      }),
    ]);

    const perGiornoMap = new Map<string, number>();
    const perMeseMap = new Map<string, number>();
    for (const r of rows) {
      const giorno = r.data.toISOString().slice(0, 10); // YYYY-MM-DD
      const mese = giorno.slice(0, 7); // YYYY-MM
      perGiornoMap.set(giorno, (perGiornoMap.get(giorno) ?? 0) + dec(r.importo));
      perMeseMap.set(mese, (perMeseMap.get(mese) ?? 0) + dec(r.importo));
    }

    return {
      oggi: dec(oggiAgg._sum.importo),
      mese: dec(meseAgg._sum.importo),
      totale: dec(totaleAgg._sum.importo),
      perGiorno: [...perGiornoMap.entries()]
        .map(([data, totale]) => ({ data, totale }))
        .sort((a, b) => a.data.localeCompare(b.data)),
      perMese: [...perMeseMap.entries()]
        .map(([mese, totale]) => ({ mese, totale }))
        .sort((a, b) => a.mese.localeCompare(b.mese)),
    };
  }
}
