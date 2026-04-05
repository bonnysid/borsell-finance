import { CurrencyCode, NumberString, PortfolioSummaryDtoShape } from '@packages/types';

export class PortfolioSummaryDto implements PortfolioSummaryDtoShape {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  pnlToday: NumberString;
  pnlTodayPercent: number;

  currencyCode: CurrencyCode;

  constructor(data: PortfolioSummaryDtoShape) {
    this.marketPrice = data.marketPrice;
    this.costBasis = data.costBasis;
    this.totalInvested = data.totalInvested;
    this.totalWithdrawn = data.totalWithdrawn;
    this.realizedPnl = data.realizedPnl;
    this.pnlToday = data.pnlToday;
    this.pnlTodayPercent = data.pnlTodayPercent;

    this.currencyCode = data.currencyCode;
  }
}
