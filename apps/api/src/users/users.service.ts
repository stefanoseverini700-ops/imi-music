import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Utente (con hash) per il login — filtrato per tenant. */
  findByEmail(tenantId: string, email: string) {
    return this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.findByEmail(tenantId, dto.email);
    if (existing) {
      throw new ConflictException('Email già registrata per questo tenant');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.user.create({
      data: {
        tenantId,
        nome: dto.nome,
        email: dto.email,
        ruolo: dto.ruolo,
        dipartimento: dto.dipartimento ?? null,
        passwordHash,
      },
      select: this.publicSelect,
    });
  }

  findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: this.publicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: this.publicSelect,
    });
    if (!user) throw new NotFoundException('Utente non trovato');
    return user;
  }

  /** Colonne esposte: mai `passwordHash`. */
  private readonly publicSelect = {
    id: true,
    nome: true,
    email: true,
    ruolo: true,
    dipartimento: true,
    stato: true,
    createdAt: true,
  } as const;
}
