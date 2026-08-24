import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ReleaseStatus } from '@imi/shared';

export class CreateReleaseDto {
  @IsUUID()
  artistId!: string;

  @IsString()
  @MinLength(1)
  titolo!: string;

  @IsOptional()
  @IsDateString()
  dataUscita?: string;

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsString()
  genere?: string;

  @IsOptional()
  @IsBoolean()
  explicit?: boolean;

  @IsOptional()
  @IsEnum(ReleaseStatus)
  stato?: ReleaseStatus;
}

export class UpdateReleaseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  titolo?: string;

  @IsOptional()
  @IsDateString()
  dataUscita?: string;

  @IsOptional()
  @IsString()
  isrc?: string;

  @IsOptional()
  @IsString()
  genere?: string;

  @IsOptional()
  @IsBoolean()
  explicit?: boolean;

  @IsOptional()
  @IsEnum(ReleaseStatus)
  stato?: ReleaseStatus;
}

/** Label Copy: scheda metadati della release (crediti, link, testi). */
export class UpsertLabelCopyDto {
  @IsOptional()
  @IsString()
  autore?: string;

  @IsOptional()
  @IsString()
  compositore?: string;

  @IsOptional()
  @IsString()
  editori?: string;

  @IsOptional()
  @IsString()
  linkSpotify?: string;

  @IsOptional()
  @IsString()
  linkTiktok?: string;

  @IsOptional()
  @IsString()
  startTimeTiktok?: string;

  @IsOptional()
  @IsString()
  bioTerzaPersona?: string;

  @IsOptional()
  @IsString()
  descrizionePitch?: string;
}
