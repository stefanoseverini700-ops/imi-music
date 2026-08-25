import { Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { NotificheService } from './notifiche.service.js';

/** Notifiche personali: ogni utente vede solo le proprie. */
@Controller('notifiche')
export class NotificheController {
  constructor(private readonly notifiche: NotificheService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.notifiche.findAll(user);
  }

  @Get('non-lette')
  async contaNonLette(@CurrentUser() user: AuthUser) {
    return { nonLette: await this.notifiche.contaNonLette(user) };
  }

  @Patch(':id/letta')
  segnaLetta(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notifiche.segnaLetta(user, id);
  }

  @Post('leggi-tutte')
  segnaTutteLette(@CurrentUser() user: AuthUser) {
    return this.notifiche.segnaTutteLette(user);
  }
}
