import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@imi/shared';

import type { AuthUser } from '../common/rbac/current-user.decorator.js';

export interface JwtPayload {
  sub: string;
  email: string;
  ruolo: Role;
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET non configurato');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /** Il valore restituito viene assegnato a `request.user`. */
  validate(payload: JwtPayload): AuthUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token non valido');
    }
    return {
      id: payload.sub,
      email: payload.email,
      ruolo: payload.ruolo,
      tenantId: payload.tenantId,
    };
  }
}
