export enum CurrencyType {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
  VIRTUAL = 'VIRTUAL', // Для специфичных вещей, если нужно
}

export type CurrencyDtoShape = {
  code: string;
  name: string; // "United States Dollar", "Bitcoin"
  symbol: string; // "$", "₽", "₿"
  type: CurrencyType;
  rateToBase: number;
  createAt: string;
  isBaseCurrency: boolean;
  updatedAt: string; // Чтобы знать, не протух ли курс
};
