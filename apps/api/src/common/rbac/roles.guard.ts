import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@imi/shared';

import { ROLES_KEY } from './roles.decorator.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

/**
 * Guard RBAC globale — livello 1 (ruolo macro) dell'isolamento rigido.
 *
 * NB (Sprint 0 skeleton): l'autenticazione JWT arriva in Sprint 1. Per ora il
 * guard legge `request.user` (che sarà popolato dallo strato Auth) e nega
 * l'accesso alle route protette finché l'utente non è autenticato. Il livello 2
 * (permessi di riga/colonna per modulo) userà `can()` da @imi/shared nei servizi.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<{ user?: { ruolo?: Role } }>();
    const user = request.user;

    if (!user?.ruolo) {
      throw new ForbiddenException('Autenticazione richiesta');
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      // Route protetta senza ruoli specifici: basta essere autenticati.
      return true;
    }

    if (!requiredRoles.includes(user.ruolo)) {
      throw new ForbiddenException('Ruolo non autorizzato per questa risorsa');
    }

    return true;
  }
}
