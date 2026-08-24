import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { Role } from '@imi/shared';

/** Utente autenticato, popolato da `JwtStrategy.validate` su `request.user`. */
export interface AuthUser {
  id: string;
  email: string;
  ruolo: Role;
  tenantId: string;
}

/** Estrae l'utente autenticato dalla request: `@CurrentUser() user: AuthUser`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
