import { IsEnum } from 'class-validator';
import { LeadStatus } from '@imi/shared';

/** Spostamento del lead tra le colonne del kanban. */
export class ChangeLeadStatusDto {
  @IsEnum(LeadStatus)
  stato!: LeadStatus;
}
