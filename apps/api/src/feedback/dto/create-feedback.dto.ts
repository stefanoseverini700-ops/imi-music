import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  testo!: string;
}
