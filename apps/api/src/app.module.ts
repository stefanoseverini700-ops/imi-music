import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module.js';
import { HealthController } from './health/health.controller.js';
import { JwtAuthGuard } from './common/rbac/jwt-auth.guard.js';
import { RolesGuard } from './common/rbac/roles.guard.js';

// Moduli di dominio (monolite modulare — cfr. ARCHITETTURA.md §4).
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ArtistsModule } from './artists/artists.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { SalesModule } from './sales/sales.module.js';
import { DeliveryModule } from './delivery/delivery.module.js';
import { TicketingModule } from './ticketing/ticketing.module.js';
import { BookingModule } from './booking/booking.module.js';

@Module({
  imports: [
    // Carica anche il .env della radice del monorepo (cwd in dev è apps/api).
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ArtistsModule,
    LeadsModule,
    SalesModule,
    DeliveryModule,
    TicketingModule,
    BookingModule,
  ],
  controllers: [HealthController],
  providers: [
    // Ordine dei guard globali: prima autenticazione (JWT), poi RBAC per ruolo.
    // Le route pubbliche si marcano con @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
