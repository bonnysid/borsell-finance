import { CurrencyCode, CurrencyDtoShape, CurrencyType, NumberString } from '@packages/types';

import { CurrencyEntity } from '@/modules/currency';

export class CurrencyDto implements CurrencyDtoShape {
  code: CurrencyCode;
  name: string;
  symbol: string;
  type: CurrencyType;
  rateToBase: NumberString;
  updatedAt: string;

  constructor(currency: CurrencyEntity) {
    this.code = currency.code;
    this.name = currency.name;
    this.symbol = currency.symbol;
    this.type = currency.type;
    this.rateToBase = currency.rateToBase;
    this.updatedAt = currency.updatedAt;
  }
}
