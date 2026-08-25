import { Injectable, NotFoundException } from '@nestjs/common';
import type { NotificationType as DbTipo } from '@imi/db';

import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from '../common/rbac/current-user.decorator.js';
import { EmailService } from './email.service.js';

/** Notifiche in-app + email transazionale (Sprint 6). */
@Injectable()
export class NotificheService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  findAll(user: AuthUser) {
    return this.prisma.notification.findMany({
      where: { tenantId: user.tenantId, userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  contaNonLette(user: AuthUser) {
    return this.prisma.notification.count({
      where: { tenantId: user.tenantId, userId: user.id, letto: false },
    });
  }

  async segnaLetta(user: AuthUser, id: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id, tenantId: user.tenantId, userId: user.id },
    });
    if (!n) throw new NotFoundException('Notifica non trovata');
    return this.prisma.notification.update({ where: { id }, data: { letto: true } });
  }

  async segnaTutteLette(user: AuthUser) {
    const r = await this.prisma.notification.updateMany({
      where: { tenantId: user.tenantId, userId: user.id, letto: false },
      data: { letto: true },
    });
    return { aggiornate: r.count };
  }

  /**
   * Crea la notifica in-app e prova a inviare l'email.
   * Non solleva mai: una notifica fallita non deve bloccare l'operazione
   * applicativa che l'ha generata.
   */
  async notifica(
    tenantId: string,
    userId: string,
    tipo: DbTipo,
    testo: string,
    oggettoEmail?: string,
  ): Promise<void> {
    try {
      await this.prisma.notification.create({ data: { tenantId, userId, tipo, testo } });
      const destinatario = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (destinatario?.email) {
        await this.email.invia(destinatario.email, oggettoEmail ?? 'IMI Music', testo);
      }
    } catch {
      /* la notifica è best-effort */
    }
  }
}
