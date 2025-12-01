import { ChangePasswordDtoShape } from '@packages/types';
import { IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto implements ChangePasswordDtoShape {
  @IsString()
  oldPassword: string;

  @IsStrongPassword()
  newPassword: string;
}
