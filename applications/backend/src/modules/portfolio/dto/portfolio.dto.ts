import { AssetDtoShape, CurrencyDtoShape, PortfolioDtoShape, PortfolioType } from '@packages/types';

import { AssetDto, CurrencyDto, PortfolioEntity } from '@/modules';

export class PortfolioDto implements PortfolioDtoShape {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  cachedTotalValue: number;
  lastValuationAt: string;
  currency: CurrencyDtoShape;
  assets: AssetDtoShape[];
  cachedDailyChangePercent: number;
  type: PortfolioType;
  userId: string;

  constructor(portfolio: PortfolioEntity) {
    this.id = portfolio.id;
    this.name = portfolio.name;
    this.description = portfolio.description;
    this.createdAt = portfolio.createdAt;
    this.updatedAt = portfolio.updatedAt;
    this.cachedTotalValue = portfolio.cachedTotalValue;
    this.lastValuationAt = portfolio.lastValuationAt;
    this.currency = new CurrencyDto(portfolio.baseCurrency);
    this.userId = portfolio.userId;
    this.assets = portfolio.assets.map((it) => new AssetDto(it));
  }
}
