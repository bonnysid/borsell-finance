import { DateString } from '../shared';

export enum CurrencyType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
  VIRTUAL = 'VIRTUAL', // Для специфичных вещей, если нужно
}

export type CurrencyCode = string;

export type CurrencyDtoShape = {
  code: CurrencyCode;
  name: string; // "United States Dollar", "Bitcoin"
  symbol: string; // "$", "₽", "₿"
  type: CurrencyType;
  rateToBase: number;
  isBaseCurrency: boolean;
  updatedAt: DateString; // Чтобы знать, не протух ли курс
};
