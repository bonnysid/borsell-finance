import { AssetDtoShape } from 'packages/types/src/asset';

import { CurrencyCode, CurrencyDtoShape } from '../currency';
import { DateString, ID } from '../shared';

export enum PortfolioType {
  MAIN = 'MAIN', // Реальный портфель
  WATCHLIST = 'WATCHLIST', // Просто слежу
  SIMULATION = 'SIMULATION', // Демо-счет
}

export type PortfolioAssetDtoShape = {
  id: ID;
  portfolioId: ID;
  asset: AssetDtoShape;
  quantity: number;
  buyPrice: number;
  currencyCode: CurrencyCode;
  createdAt: DateString;
  updatedAt: DateString;
};

export type PortfolioDtoShape = {
  id: ID;
  userId: ID;

  name: string;
  description?: string;

  currency: CurrencyDtoShape;

  type: PortfolioType;

  cachedTotalValue: number;
  cachedDailyChangePercent: number;
  lastValuationAt: DateString;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];
};
