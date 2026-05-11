import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsUUID()
  @IsOptional()
  sessionId?: string;
}
