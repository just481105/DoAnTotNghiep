import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';

export class ReviewGradeDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  vocabularyId: string;

  @IsInt()
  @Min(0)
  @Max(5)
  quality: number;
}
