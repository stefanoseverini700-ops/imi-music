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

export class CreateArtistDto {
  @IsString()
  @MinLength(2)
  nome!: string;

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

  /** Collega l'artista a un account utente (ruolo ARTISTA) esistente. */
  @IsOptional()
  @IsUUID()
  userId?: string;
}
