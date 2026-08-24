import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { LeadStatus } from '@imi/shared';

/** Aggiornamento parziale dei campi del lead (non l'assegnazione). */
export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsString()
  fonte?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valoreStimato?: number;

  @IsOptional()
  @IsEnum(LeadStatus)
  stato?: LeadStatus;
}
