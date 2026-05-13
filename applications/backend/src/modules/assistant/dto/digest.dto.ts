import { IsOptional, IsUUID } from 'class-validator';

export class DigestDto {
  @IsUUID()
  @IsOptional()
  sessionId?: string;
}
