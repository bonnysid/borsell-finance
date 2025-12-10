import {
  CurrencyDtoShape,
  DateString,
  ID,
  PortfolioDtoShape,
  PortfolioType,
} from '@packages/types';

import { CurrencyDto, PortfolioAssetDto, PortfolioEntity } from '@/modules';

export class PortfolioDto implements PortfolioDtoShape {
  id: ID;
  name: string;
  description?: string;
  createdAt: DateString;
  updatedAt: DateString;
  cachedTotalValue: number;
  lastValuationAt: DateString;
  currency: CurrencyDtoShape;
  assets: PortfolioDtoShape['assets'];
  cachedDailyChangePercent: number;
  type: PortfolioType;
  userId: ID;

  constructor(portfolio: PortfolioEntity) {
    this.id = portfolio.id;
    this.name = portfolio.name;
    this.description = portfolio.description;
    this.createdAt = portfolio.createdAt;
    this.updatedAt = portfolio.updatedAt;
    this.cachedTotalValue = portfolio.cachedTotalValue;
    this.lastValuationAt = portfolio.lastValuationAt;
    this.currency = new CurrencyDto(portfolio.baseCurrency);
    this.userId = portfolio.user.id;
    this.assets = portfolio.assets.map((it) => new PortfolioAssetDto(it));
  }
}
