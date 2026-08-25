import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { TicketingService } from './ticketing.service.js';
import {
  CreateDipartimentoDto,
  CreateMessaggioDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/ticketing.dto.js';

/** Ticketing interno per dipartimento (Sprint 5). */
@Controller('ticketing')
export class TicketingController {
  constructor(private readonly ticketing: TicketingService) {}

  // --- Dipartimenti ---
  @Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
  @Get('dipartimenti')
  findAllDipartimenti(@CurrentUser() user: AuthUser) {
    return this.ticketing.findAllDipartimenti(user.tenantId);
  }

  @Roles(Role.ADMIN)
  @Post('dipartimenti')
  createDipartimento(@CurrentUser() user: AuthUser, @Body() dto: CreateDipartimentoDto) {
    return this.ticketing.createDipartimento(user.tenantId, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('dipartimenti/:id')
  removeDipartimento(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketing.removeDipartimento(user.tenantId, id);
  }

  // --- Ticket (accessibili anche agli Artisti, che vedono solo i propri) ---
  @Get('ticket')
  findAll(@CurrentUser() user: AuthUser) {
    return this.ticketing.findAll(user);
  }

  @Get('ticket/:id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketing.findOne(user, id);
  }

  @Post('ticket')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTicketDto) {
    return this.ticketing.create(user, dto);
  }

  @Patch('ticket/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketing.update(user, id, dto);
  }

  @Post('ticket/:id/messaggi')
  addMessaggio(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateMessaggioDto,
  ) {
    return this.ticketing.addMessaggio(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('ticket/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketing.remove(user, id);
  }
}
