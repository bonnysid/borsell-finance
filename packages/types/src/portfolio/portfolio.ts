import { CurrencyCode } from '../currency';
import { DateString, ID } from '../shared';
import { PortfolioAssetDtoShape } from './portfolio-asset';

export enum PortfolioType {
  MAIN = 'MAIN', // Реальный портфель
  WATCHLIST = 'WATCHLIST', // Просто слежу
  SIMULATION = 'SIMULATION', // Демо-счет
}

export type PortfolioDtoShape = {
  id: ID;
  userId: ID;

  name: string;
  description?: string;

  type: PortfolioType;

  // cachedTotalValue: NumberString;
  // cachedDailyChangePercent: NumberString;
  // lastValuationAt: DateString;

  currencyCode: CurrencyCode;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];
};

export type CreatePortfolioDtoShape = {
  name: string;
  description?: string;
  userAssetsIds: ID[];
  type?: PortfolioType;
};
