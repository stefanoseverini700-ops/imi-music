import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ServiceCategory } from '@imi/shared';

export class CreateServizioDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsEnum(ServiceCategory)
  categoria!: ServiceCategory;

  @IsNumber()
  @Min(0)
  prezzoBase!: number;
}

export class UpdateServizioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEnum(ServiceCategory)
  categoria?: ServiceCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prezzoBase?: number;

  @IsOptional()
  @IsBoolean()
  attivo?: boolean;
}
