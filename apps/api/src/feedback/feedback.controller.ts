import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { FeedbackService } from './feedback.service.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';

/** Bacheca feedback interna al team (Sprint 3). */
@Roles(Role.ADMIN, Role.SALES, Role.OPERATORE)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.feedback.findAll(user);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeedbackDto) {
    return this.feedback.create(user, dto.testo);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.feedback.remove(user, id);
  }
}
