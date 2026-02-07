import { ChangeCurrencyDtoShape, CurrencyCode } from '@packages/types';
import { IsString } from 'class-validator';

export class ChangeCurrencyDto implements ChangeCurrencyDtoShape {
  @IsString()
  currencyCode: CurrencyCode;
}
