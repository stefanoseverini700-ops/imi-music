import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

/** Gestione utenti — solo Admin, tranne il cambio della propria password. */
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /**
   * Cambio della PROPRIA password: consentito a ogni ruolo autenticato.
   * `@Roles()` senza argomenti annulla il vincolo Admin del controller.
   */
  @Roles()
  @Patch('me/password')
  cambiaPassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.users.cambiaPassword(user.id, dto.passwordAttuale, dto.passwordNuova);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.users.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.findOne(user.tenantId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.users.create(user.tenantId, dto);
  }
}
