import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { CalendarioService } from './calendario.service.js';
import { CreateAppuntamentoDto } from './dto/create-appuntamento.dto.js';

/** Calendario condiviso dello staff (Sprint 3): call, riunioni, assenze. */
@Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
@Controller('calendario')
export class CalendarioController {
  constructor(private readonly calendario: CalendarioService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.calendario.findAll(user);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAppuntamentoDto) {
    return this.calendario.create(user, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calendario.remove(user, id);
  }
}
