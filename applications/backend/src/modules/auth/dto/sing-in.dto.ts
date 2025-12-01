import { SignInDtoShape } from '@packages/types';
import { IsString } from 'class-validator';

export class SingInDto implements SignInDtoShape {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
