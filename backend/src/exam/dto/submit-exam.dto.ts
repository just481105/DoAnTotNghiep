import { IsObject } from 'class-validator';

export class SubmitExamDto {
  /** { [questionId]: selectedOptionId } */
  @IsObject()
  answers: Record<string, string>;
}
