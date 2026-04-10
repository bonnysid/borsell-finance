import {
  CurrencyCode,
  DateString,
  NumberString,
  PortfolioHistoryDtoShape,
  PortfolioHistoryItemDtoShape,
} from '@packages/types';

export class PortfolioHistoryItemDto implements PortfolioHistoryItemDtoShape {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;
  createdAt: DateString;

  constructor(data: Partial<PortfolioHistoryItemDto>) {
    Object.assign(this, data);
  }
}

export class PortfolioHistoryDto implements PortfolioHistoryDtoShape {
  items: PortfolioHistoryItemDto[];
  currencyCode: CurrencyCode;

  constructor(data: { items: PortfolioHistoryItemDto[]; currencyCode: CurrencyCode }) {
    this.items = data.items;
    this.currencyCode = data.currencyCode;
  }
}
