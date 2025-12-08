import { AssetDtoShape } from '../asset';
import { CurrencyDtoShape } from '../currency';

export enum PortfolioType {
  MAIN = 'MAIN', // Реальный портфель
  WATCHLIST = 'WATCHLIST', // Просто слежу
  SIMULATION = 'SIMULATION', // Демо-счет
}

export type PortfolioDtoShape = {
  id: string;
  userId: string;

  name: string;
  description?: string;

  currency: CurrencyDtoShape;

  type: PortfolioType;

  cachedTotalValue: number;
  cachedDailyChangePercent: number;
  lastValuationAt: string;

  createdAt: string;
  updatedAt: string;

  assets: AssetDtoShape[];
};
