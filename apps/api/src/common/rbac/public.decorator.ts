import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca una route come pubblica (salta il RolesGuard globale). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
