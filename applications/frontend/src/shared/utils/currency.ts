import { CurrencyCode } from '@packages/types';

const currencySymbols: Record<CurrencyCode, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '$',
  USD: '$',
  RUB: '₽',
  EUR: '€',
};

export const getCurrencySymbol = (currencyCode: CurrencyCode) => {
  return currencySymbols[currencyCode] ?? currencyCode;
};
