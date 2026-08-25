import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';

/**
 * Portale artista (Sprint 6): vista in SOLA LETTURA dei propri dati.
 * L'artista non vede altri artisti, KPI interni o prezzi di listino
 * (cfr. ARCHITETTURA.md §3).
 */
@Injectable()
export class PortaleService {
  constructor(private readonly prisma: PrismaService) {}

  /** Risolve l'anagrafica artista collegata all'account autenticato. */
  private async artistaDi(user: AuthUser) {
    const artist = await this.prisma.artist.findFirst({
      where: { userId: user.id, tenantId: user.tenantId },
    });
    if (!artist) {
      throw new ForbiddenException(
        'Nessuna scheda artista collegata a questo account. Contatta la tua agenzia.',
      );
    }
    return artist;
  }

  async panoramica(user: AuthUser) {
    const artist = await this.artistaDi(user);

    const [piani, releases, files, tickets, eventi] = await Promise.all([
      // Piani di delivery: fasi e avanzamento, senza prezzi.
      this.prisma.deliveryPlan.findMany({
        where: { artistId: artist.id, tenantId: user.tenantId },
        include: {
          stages: {
            orderBy: { ordine: 'asc' },
            include: { service: { select: { nome: true, categoria: true } } },
          },
        },
      }),
      this.prisma.release.findMany({
        where: { artistId: artist.id, tenantId: user.tenantId },
        orderBy: [{ dataUscita: 'desc' }],
        include: { labelCopy: true },
      }),
      this.prisma.fileAsset.findMany({
        where: { tenantId: user.tenantId, ownerType: 'ARTIST', ownerId: artist.id },
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { nome: true } } },
      }),
      this.prisma.ticket.findMany({
        where: { tenantId: user.tenantId, creatoDa: user.id },
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { nome: true } }, _count: { select: { messages: true } } },
      }),
      // Proposte live: l'artista le legge (cfr. modulo "Trova Live & Festival").
      this.prisma.event.findMany({
        where: { artistId: artist.id, tenantId: user.tenantId },
        orderBy: { data: 'asc' },
        include: { venue: { select: { nome: true, citta: true } } },
      }),
    ]);

    return {
      artista: {
        id: artist.id,
        nome: artist.nome,
        citta: artist.citta,
        genereMusicale: artist.genereMusicale,
        piano: artist.piano,
      },
      piani: piani.map((p) => ({
        id: p.id,
        stato: p.stato,
        avanzamento:
          p.stages.length > 0
            ? Math.round(p.stages.reduce((s, st) => s + st.percentuale, 0) / p.stages.length)
            : 0,
        fasi: p.stages.map((s) => ({
          id: s.id,
          nome: s.service.nome,
          categoria: s.service.categoria,
          percentuale: s.percentuale,
        })),
      })),
      releases,
      files,
      tickets,
      eventi,
    };
  }

  /** Consente all'artista di scaricare solo i file di sua proprietà. */
  async fileConsentito(user: AuthUser, fileId: string) {
    const artist = await this.artistaDi(user);
    const file = await this.prisma.fileAsset.findFirst({
      where: {
        id: fileId,
        tenantId: user.tenantId,
        ownerType: 'ARTIST',
        ownerId: artist.id,
      },
    });
    if (!file) throw new NotFoundException('File non trovato');
    return file;
  }
}
