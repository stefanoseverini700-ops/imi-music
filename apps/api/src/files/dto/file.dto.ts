import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { FileAssetType, FileOwnerType } from '@imi/shared';

/** Metadati inviati insieme al file caricato. */
export class UploadFileDto {
  @IsEnum(FileOwnerType)
  ownerType!: FileOwnerType;

  @IsUUID()
  ownerId!: string;

  @IsOptional()
  @IsEnum(FileAssetType)
  tipo?: FileAssetType;

  /** Cartella condivisa per ruolo (producer, grafico, video maker, ...). */
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

/** Registrazione di un file ospitato altrove (link esterno). */
export class CollegaFileDto extends UploadFileDto {
  @IsString()
  @MinLength(3)
  nomeFile!: string;

  @IsString()
  @MinLength(4)
  url!: string;
}
