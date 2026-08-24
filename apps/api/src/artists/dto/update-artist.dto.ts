import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ArtistPlan } from '@imi/shared';

/** Tutti i campi opzionali: aggiornamento parziale (PATCH). */
export class UpdateArtistDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsString()
  citta?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsString()
  genereMusicale?: string;

  @IsOptional()
  @IsEnum(ArtistPlan)
  piano?: ArtistPlan;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
