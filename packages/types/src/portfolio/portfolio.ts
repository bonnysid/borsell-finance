import { CurrencyCode } from '../currency';
import { DateString, ID, NumberString } from '../shared';
import { PortfolioAssetDtoShape } from './portfolio-asset';

export enum PortfolioType {
  MAIN = 'MAIN', // Реальный портфель
  WATCHLIST = 'WATCHLIST', // Просто слежу
  SIMULATION = 'SIMULATION', // Демо-счет
}

export type PortfolioDtoShape = {
  id: ID;

  name: string;
  description?: string;

  type: PortfolioType;
  currencyCode: CurrencyCode;

  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  lastValuationAt?: DateString;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];
};

export type PortfolioSummaryDtoShape = {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  pnlMonth: NumberString;
  pnlMonthPercent: number;

  currencyCode: CurrencyCode;
};

export type CreatePortfolioDtoShape = {
  name: string;
  description?: string;
  userAssetsIds: ID[];
  type?: PortfolioType;
};

export type PortfolioAllocationItemDtoShape = {
  id: string;
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color?: string;
};

export type PortfolioAllocationDtoShape = {
  items: PortfolioAllocationItemDtoShape[];
  totalValue: number;
  currencyCode: CurrencyCode;
};

export type PortfolioHistoryItemDtoShape = {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;
  createdAt: DateString;
};

export type PortfolioHistoryDtoShape = {
  items: PortfolioHistoryItemDtoShape[];
  currencyCode: CurrencyCode;
};
