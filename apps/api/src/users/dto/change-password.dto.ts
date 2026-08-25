import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  passwordAttuale!: string;

  @IsString()
  @MinLength(8)
  passwordNuova!: string;
}
