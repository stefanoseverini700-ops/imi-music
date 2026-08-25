import { Global, Module } from '@nestjs/common';

import { NotificheService } from './notifiche.service.js';
import { NotificheController } from './notifiche.controller.js';
import { EmailService } from './email.service.js';

/** Globale: qualsiasi dominio può iniettare NotificheService per avvisare gli utenti. */
@Global()
@Module({
  controllers: [NotificheController],
  providers: [NotificheService, EmailService],
  exports: [NotificheService, EmailService],
})
export class NotificheModule {}
