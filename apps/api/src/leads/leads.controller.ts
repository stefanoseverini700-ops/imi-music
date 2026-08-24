import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { LeadStatus as DbLeadStatus } from '@imi/db';
import { LeadStatus, Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { LeadsService } from './leads.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { AssignLeadDto } from './dto/assign-lead.dto.js';
import { ChangeLeadStatusDto } from './dto/change-lead-status.dto.js';

/** Pipeline lead (kanban). Accesso staff vendite: Admin e Sales. */
@Roles(Role.ADMIN, Role.SALES)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query('stato') stato?: string) {
    if (stato !== undefined && !(stato in LeadStatus)) {
      throw new BadRequestException('Stato lead non valido');
    }
    return this.leads.findAll(user, stato as DbLeadStatus | undefined);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.findOne(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLeadDto) {
    return this.leads.create(user, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(user, id, dto);
  }

  /** Sposta il lead tra le colonne del kanban. */
  @Patch(':id/stato')
  changeStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ChangeLeadStatusDto,
  ) {
    return this.leads.changeStatus(user, id, dto.stato as DbLeadStatus);
  }

  /** Assegnazione lead — solo Admin. */
  @Roles(Role.ADMIN)
  @Patch(':id/assegna')
  assign(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.leads.assign(user, id, dto.assegnatoA);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.remove(user, id);
  }
}
