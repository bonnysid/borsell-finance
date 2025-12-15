import { AssetDtoShape } from 'packages/types/src/asset';

import { DateString, ID, NumberString } from '../shared';

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
  createdAt: DateString;
  updatedAt: DateString;
};

export type PortfolioDtoShape = {
  id: ID;
  userId: ID;

  name: string;
  description?: string;

  type: PortfolioType;

  cachedTotalValue: NumberString;
  cachedDailyChangePercent: number;
  lastValuationAt: DateString;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];
};

export type CreatePortfolioAssetDtoShape = {
  assetId: ID;
  quantity: number;
  buyPrice: number;
};

export type CreatePortfolioDtoShape = {
  name: string;
  description?: string;
  assets: CreatePortfolioAssetDtoShape[];
  type?: PortfolioType;
};
