import { CurrencyCode, NumberString } from '@packages/types';

export class PortfolioHistoryItemDto {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;
  createdAt: Date;

  constructor(data: Partial<PortfolioHistoryItemDto>) {
    Object.assign(this, data);
  }
}

export class PortfolioHistoryDto {
  items: PortfolioHistoryItemDto[];
  currencyCode: CurrencyCode;

  constructor(data: { items: PortfolioHistoryItemDto[]; currencyCode: CurrencyCode }) {
    this.items = data.items;
    this.currencyCode = data.currencyCode;
  }
}
