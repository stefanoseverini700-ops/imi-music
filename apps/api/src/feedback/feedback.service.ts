import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@imi/shared';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /** Bacheca condivisa del tenant, dal più recente. */
  findAll(user: AuthUser) {
    return this.prisma.feedback.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { autore: { select: { id: true, nome: true } } },
    });
  }

  create(user: AuthUser, testo: string) {
    return this.prisma.feedback.create({
      data: { tenantId: user.tenantId, autoreId: user.id, testo },
      include: { autore: { select: { id: true, nome: true } } },
    });
  }

  /** Elimina un messaggio: l'autore il proprio, l'Admin qualsiasi. */
  async remove(user: AuthUser, id: string) {
    const msg = await this.prisma.feedback.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        ...(user.ruolo === Role.ADMIN ? {} : { autoreId: user.id }),
      },
    });
    if (!msg) throw new NotFoundException('Messaggio non trovato');
    await this.prisma.feedback.delete({ where: { id } });
    return { id, deleted: true };
  }
}
