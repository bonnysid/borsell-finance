import { CurrencyCode, NumberString, PortfolioSummaryDtoShape } from '@packages/types';

export class PortfolioSummaryDto implements PortfolioSummaryDtoShape {
  marketPrice: NumberString;
  costBasis: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  realizedPnl: NumberString;

  pnlMonth: NumberString;
  pnlMonthPercent: number;

  currencyCode: CurrencyCode;

  constructor(data: PortfolioSummaryDtoShape) {
    this.marketPrice = data.marketPrice;
    this.costBasis = data.costBasis;
    this.totalInvested = data.totalInvested;
    this.totalWithdrawn = data.totalWithdrawn;
    this.realizedPnl = data.realizedPnl;
    this.pnlMonth = data.pnlMonth;
    this.pnlMonthPercent = data.pnlMonthPercent;

    this.currencyCode = data.currencyCode;
  }
}
