import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

/** Registrazione vendite + cruscotto incassi. Accesso: Admin e Sales. */
@Roles(Role.ADMIN, Role.SALES)
@Controller('sales')
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.sales.findAll(user);
  }

  /** Cruscotto incassi (giornaliero/mensile), filtrato per ruolo. */
  @Get('dashboard/incassi')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.sales.dashboardIncassi(user);
  }

  /** KPI per venditore, filtrati per ruolo (i Sales vedono solo i propri). */
  @Get('dashboard/kpi')
  kpi(@CurrentUser() user: AuthUser) {
    return this.sales.kpiVenditori(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sales.findOne(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSaleDto) {
    return this.sales.create(user, dto);
  }
}
