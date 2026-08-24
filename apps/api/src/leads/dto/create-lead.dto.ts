import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { LeadStatus } from '@imi/shared';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  nome!: string;

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

  /** Assegnatario (solo Admin può assegnare ad altri; i Sales creano su di sé). */
  @IsOptional()
  @IsUUID()
  assegnatoA?: string;
}
