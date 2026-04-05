import {
  CurrencyCode,
  DateString,
  ID,
  NumberString,
  PortfolioAssetDtoShape,
  PortfolioDtoShape,
  PortfolioType,
} from '@packages/types';

import { PortfolioEntity } from '../entities';
import { PortfolioAssetDto } from './portfolio-asset.dto';

export class PortfolioDto implements PortfolioDtoShape {
  id: ID;

  name: string;
  description?: string;

  type: PortfolioType;

  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  lastValuationAt?: DateString;

  currencyCode: CurrencyCode;

  createdAt: DateString;
  updatedAt: DateString;

  assets: PortfolioAssetDtoShape[];

  constructor(portfolio: PortfolioEntity) {
    this.id = portfolio.id;

    this.name = portfolio.name;
    this.description = portfolio.description;

    this.type = portfolio.type;

    this.marketPrice = portfolio.marketPrice;
    this.costBasis = portfolio.costBasis;
    this.totalInvested = portfolio.totalInvested;
    this.totalWithdrawn = portfolio.totalWithdrawn;
    this.realizedPnl = portfolio.realizedPnl;

    this.lastValuationAt = portfolio.lastValuationAt?.toISOString();

    this.currencyCode = portfolio.currencyCode;

    this.createdAt = portfolio.createdAt.toISOString();
    this.updatedAt = portfolio.updatedAt.toISOString();

    this.assets = portfolio.assets.map((it) => new PortfolioAssetDto(it));
  }
}
