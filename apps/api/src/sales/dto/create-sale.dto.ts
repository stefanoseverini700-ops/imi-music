import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { PaymentStatus } from '@imi/shared';

export class CreateSaleDto {
  @IsUUID()
  artistId!: string;

  @IsOptional()
  @IsUUID()
  leadId?: string;

  @IsNumber()
  @IsPositive()
  importo!: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  statoPagamento?: PaymentStatus;

  /** Data della vendita (ISO). Default: adesso. */
  @IsOptional()
  @IsDateString()
  data?: string;

  /** Venditore: solo l'Admin può indicarne uno diverso da sé. */
  @IsOptional()
  @IsUUID()
  venditoreId?: string;
}
