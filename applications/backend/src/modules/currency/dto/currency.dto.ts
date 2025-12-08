import { CurrencyCode, CurrencyDtoShape, CurrencyType } from '@packages/types';

import { CurrencyEntity } from '@/modules';

export class CurrencyDto implements CurrencyDtoShape {
  code: CurrencyCode;
  name: string;
  symbol: string;
  type: CurrencyType;
  rateToBase: number;
  isBaseCurrency: boolean;
  updatedAt: string;

  constructor(currency: CurrencyEntity) {
    this.code = currency.code;
    this.name = currency.name;
    this.symbol = currency.symbol;
    this.type = currency.type;
    this.rateToBase = currency.rateToBase;
    this.isBaseCurrency = currency.isBaseCurrency;
    this.updatedAt = currency.updatedAt;
  }
}
