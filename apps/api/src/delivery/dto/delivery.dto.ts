import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { DeliveryPlanStatus, TaskPriority, TaskStatus } from '@imi/shared';

export class CreatePianoDto {
  @IsUUID()
  artistId!: string;

  @IsOptional()
  @IsUUID()
  saleId?: string;

  @IsOptional()
  @IsEnum(DeliveryPlanStatus)
  stato?: DeliveryPlanStatus;
}

export class UpdatePianoDto {
  @IsEnum(DeliveryPlanStatus)
  stato!: DeliveryPlanStatus;
}

export class CreateStageDto {
  @IsUUID()
  serviceId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentuale?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordine?: number;
}

export class UpdateStageDto {
  @IsInt()
  @Min(0)
  @Max(100)
  percentuale!: number;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  titolo!: string;

  @IsOptional()
  @IsUUID()
  deliveryStageId?: string;

  @IsOptional()
  @IsString()
  descrizione?: string;

  @IsOptional()
  @IsUUID()
  assegnatoA?: string;

  @IsOptional()
  @IsDateString()
  scadenza?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priorita?: TaskPriority;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  stato?: TaskStatus;

  @IsOptional()
  @IsUUID()
  assegnatoA?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priorita?: TaskPriority;
}
