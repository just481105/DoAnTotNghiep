import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(2000)
  content: string;
}

export class ChatDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}

export class WritingDto {
  @IsString()
  @MaxLength(1000)
  prompt: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  essayText: string;

  @IsIn(['VSTEP_TASK_1', 'VSTEP_TASK_2'])
  taskType: 'VSTEP_TASK_1' | 'VSTEP_TASK_2';
}
