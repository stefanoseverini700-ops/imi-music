import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { ReleasesService } from './releases.service.js';
import { CreateReleaseDto, UpdateReleaseDto, UpsertLabelCopyDto } from './dto/release.dto.js';

/** Discografia: release + label copy. Staff interno; scrittura Admin/Operatori. */
@Roles(Role.ADMIN, Role.OPERATORE)
@Controller('releases')
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.releases.findAll(user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReleaseDto) {
    return this.releases.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateReleaseDto) {
    return this.releases.update(user.tenantId, id, dto);
  }

  /** Crea o sostituisce la Label Copy della release. */
  @Put(':id/label-copy')
  upsertLabelCopy(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpsertLabelCopyDto,
  ) {
    return this.releases.upsertLabelCopy(user.tenantId, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.releases.remove(user.tenantId, id);
  }
}
