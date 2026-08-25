import { Controller, Get } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { PortaleService } from './portale.service.js';

/** Portale artista: sola lettura, riservato al ruolo ARTISTA. */
@Roles(Role.ARTISTA)
@Controller('portale')
export class PortaleController {
  constructor(private readonly portale: PortaleService) {}

  @Get()
  panoramica(@CurrentUser() user: AuthUser) {
    return this.portale.panoramica(user);
  }
}
