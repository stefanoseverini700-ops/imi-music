import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@imi/shared';

import { Roles } from '../common/rbac/roles.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { DeliveryService } from './delivery.service.js';
import {
  CreatePianoDto,
  CreateStageDto,
  CreateTaskDto,
  UpdatePianoDto,
  UpdateStageDto,
  UpdateTaskDto,
} from './dto/delivery.dto.js';

/**
 * Delivery (Sprint 4): piani, fasi con avanzamento e task.
 * Lettura per Admin/Operatori; creazione piani e fasi solo Admin.
 */
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}

  // --- Piani ---
  @Roles(Role.ADMIN, Role.OPERATORE)
  @Get('piani')
  findAllPiani(@CurrentUser() user: AuthUser) {
    return this.delivery.findAllPiani(user);
  }

  @Roles(Role.ADMIN)
  @Post('piani')
  createPiano(@CurrentUser() user: AuthUser, @Body() dto: CreatePianoDto) {
    return this.delivery.createPiano(user, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('piani/:id')
  updatePiano(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdatePianoDto) {
    return this.delivery.updatePiano(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('piani/:id')
  removePiano(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.delivery.removePiano(user, id);
  }

  // --- Fasi (stage) ---
  @Roles(Role.ADMIN)
  @Post('piani/:id/fasi')
  addStage(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CreateStageDto) {
    return this.delivery.addStage(user, id, dto);
  }

  /** Aggiornamento dell'avanzamento: anche gli Operatori possono farlo. */
  @Roles(Role.ADMIN, Role.OPERATORE)
  @Patch('fasi/:id')
  updateStage(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.delivery.updateStage(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('fasi/:id')
  removeStage(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.delivery.removeStage(user, id);
  }

  // --- Task ---
  @Roles(Role.ADMIN, Role.OPERATORE)
  @Get('task')
  findAllTask(@CurrentUser() user: AuthUser) {
    return this.delivery.findAllTask(user);
  }

  @Roles(Role.ADMIN)
  @Post('task')
  createTask(@CurrentUser() user: AuthUser, @Body() dto: CreateTaskDto) {
    return this.delivery.createTask(user, dto);
  }

  @Roles(Role.ADMIN, Role.OPERATORE)
  @Patch('task/:id')
  updateTask(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.delivery.updateTask(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('task/:id')
  removeTask(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.delivery.removeTask(user, id);
  }
}
