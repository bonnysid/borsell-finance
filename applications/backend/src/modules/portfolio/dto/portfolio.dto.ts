import {
  CurrencyCode,
  DateString,
  ID,
  NumberString,
  PortfolioAssetDtoShape,
  PortfolioDtoShape,
  PortfolioType,
} from '@packages/types';

import { PortfolioAssetDto } from '@/modules/asset';

import { PortfolioEntity } from '../entities';

export class PortfolioDto implements PortfolioDtoShape {
  id: ID;
  userId: ID;

  name: string;
  description?: string;

  type: PortfolioType;

  cachedTotalValue: NumberString;
  cachedDailyChangePercent: NumberString;
  lastValuationAt: DateString;

  currencyCode: CurrencyCode;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];

  constructor(portfolio: PortfolioEntity) {
    this.id = portfolio.id;
    this.userId = portfolio.user.id;

    this.name = portfolio.name;
    this.description = portfolio.description;

    this.type = portfolio.type;

    this.cachedTotalValue = portfolio.cachedTotalValue;
    this.cachedDailyChangePercent = portfolio.cachedDailyChangePercent;
    this.lastValuationAt = portfolio.lastValuationAt;

    this.createdAt = portfolio.createdAt;
    this.updatedAt = portfolio.updatedAt;

    this.assets = portfolio.assets.map((it) => new PortfolioAssetDto(it));
  }
}
