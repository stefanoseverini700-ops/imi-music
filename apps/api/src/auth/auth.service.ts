import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@imi/shared';

import { UsersService } from '../users/users.service.js';
import type { JwtPayload } from './jwt.strategy.js';
import type { LoginDto } from './dto/login.dto.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Risoluzione tenant (Sprint 1): usa il tenant di default.
   * TODO Fase 2: risolvere il tenant da host/sottodominio per il multi-tenant.
   */
  private get defaultTenantId(): string {
    return process.env.DEFAULT_TENANT_ID ?? '00000000-0000-0000-0000-000000000000';
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const tenantId = this.defaultTenantId;
    const user = await this.users.findByEmail(tenantId, dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenziali non valide');
    }
    if (user.stato !== UserStatus.ATTIVO) {
      throw new UnauthorizedException('Utente non attivo');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      // Prisma e @imi/shared definiscono `Role` con gli stessi valori ma tipi
      // nominalmente distinti: cast sicuro al confine col DB.
      ruolo: user.ruolo as Role,
      tenantId: user.tenantId,
    });
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token non valido o scaduto');
    }
    return this.issueTokens({
      sub: payload.sub,
      email: payload.email,
      ruolo: payload.ruolo,
      tenantId: payload.tenantId,
    });
  }

  private async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
