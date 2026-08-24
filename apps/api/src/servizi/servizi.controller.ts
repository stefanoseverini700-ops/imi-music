import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { ServiziService } from './servizi.service.js';
import { CreateServizioDto, UpdateServizioDto } from './dto/create-servizio.dto.js';

/** Catalogo servizi: lettura per lo staff, scrittura solo Admin. */
@Controller('servizi')
export class ServiziController {
  constructor(private readonly servizi: ServiziService) {}

  @Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.servizi.findAll(user.tenantId);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateServizioDto) {
    return this.servizi.create(user.tenantId, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateServizioDto) {
    return this.servizi.update(user.tenantId, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.servizi.remove(user.tenantId, id);
  }
}
