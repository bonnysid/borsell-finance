import { SignUpDtoShape } from '@packages/types';
import { IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

const MAX_USERNAME_LENGTH = 255;
const MIN_USERNAME_LENGTH = 4;

const MAX_PASSWORD_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;

export class SingUpDto implements SignUpDtoShape {
  @IsString()
  @MaxLength(MAX_USERNAME_LENGTH, {
    message: i18nValidationMessage('validation.MAX', { max: MAX_USERNAME_LENGTH }),
  })
  @MinLength(MIN_USERNAME_LENGTH, {
    message: i18nValidationMessage('validation.MIN', { min: MIN_USERNAME_LENGTH }),
  })
  username: string;

  @IsStrongPassword(undefined, {
    message: i18nValidationMessage('validation.notStrong'),
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: i18nValidationMessage('validation.MAX', {
      max: MAX_PASSWORD_LENGTH,
    }),
  })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: i18nValidationMessage('validation.MIN', {
      min: MIN_PASSWORD_LENGTH,
    }),
  })
  password: string;
}
