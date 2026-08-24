import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { ArtistsService } from './artists.service.js';
import { CreateArtistDto } from './dto/create-artist.dto.js';
import { UpdateArtistDto } from './dto/update-artist.dto.js';

/**
 * CRUD Artisti (Sprint 1). Isolato per tenant dell'utente autenticato.
 * Lettura: staff interno (Admin, Sales, Operatori). Scrittura: solo Admin.
 * Gli Artisti NON accedono qui: vedono solo la propria dashboard (Sprint 6).
 */
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artists: ArtistsService) {}

  @Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.artists.findAll(user.tenantId);
  }

  @Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.artists.findOne(user.tenantId, id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateArtistDto) {
    return this.artists.create(user.tenantId, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateArtistDto) {
    return this.artists.update(user.tenantId, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.artists.remove(user.tenantId, id);
  }
}
