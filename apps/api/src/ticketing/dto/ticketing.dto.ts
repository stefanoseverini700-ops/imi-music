import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '@imi/shared';

export class CreateDipartimentoDto {
  @IsString()
  @MinLength(2)
  nome!: string;
}

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  oggetto!: string;

  /** Primo messaggio del ticket. */
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  messaggio!: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  artistId?: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priorita?: TicketPriority;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  stato?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priorita?: TicketPriority;

  @IsOptional()
  @IsUUID()
  assegnatoA?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class CreateMessaggioDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  testo!: string;
}
