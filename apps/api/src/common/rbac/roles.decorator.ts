import { SetMetadata } from '@nestjs/common';
import { Role } from '@imi/shared';

export const ROLES_KEY = 'roles';

/**
 * Limita una route ai ruoli macro indicati.
 * Esempio: `@Roles(Role.ADMIN, Role.SALES)`
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
