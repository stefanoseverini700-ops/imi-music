import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AppuntamentoTipo } from '@imi/shared';

export class CreateAppuntamentoDto {
  @IsString()
  @MinLength(2)
  titolo!: string;

  /** Data e ora di inizio (ISO). */
  @IsDateString()
  inizio!: string;

  @IsOptional()
  @IsEnum(AppuntamentoTipo)
  tipo?: AppuntamentoTipo;

  /** Membro dello staff coinvolto; default: chi crea la voce. */
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
