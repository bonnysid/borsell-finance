import {
  CurrencyCode,
  PortfolioHealthStatus,
  PortfolioInsightContextShape,
  PortfolioInsightDtoShape,
  PortfolioInsightMetricShape,
  PortfolioInsightRecommendationShape,
} from '@packages/types';

export class PortfolioInsightMetricDto implements PortfolioInsightMetricShape {
  labelKey: string;
  value: string;
  tone: PortfolioHealthStatus;

  constructor(data: PortfolioInsightMetricShape) {
    this.labelKey = data.labelKey;
    this.value = data.value;
    this.tone = data.tone;
  }
}

export class PortfolioInsightContextDto implements PortfolioInsightContextShape {
  currencyCode: CurrencyCode;
  marketPrice: string;
  costBasis: string;
  totalPnl: string;
  totalPnlPercent: number;
  pnlMonth: string;
  pnlMonthPercent: number;
  assetsCount: number;
  topPositionSymbol?: string;
  topPositionPercent: number;

  constructor(data: PortfolioInsightContextShape) {
    this.currencyCode = data.currencyCode;
    this.marketPrice = data.marketPrice;
    this.costBasis = data.costBasis;
    this.totalPnl = data.totalPnl;
    this.totalPnlPercent = data.totalPnlPercent;
    this.pnlMonth = data.pnlMonth;
    this.pnlMonthPercent = data.pnlMonthPercent;
    this.assetsCount = data.assetsCount;
    this.topPositionSymbol = data.topPositionSymbol;
    this.topPositionPercent = data.topPositionPercent;
  }
}

export class PortfolioInsightDto implements PortfolioInsightDtoShape {
  status: PortfolioHealthStatus;
  score: number;
  titleKey: string;
  summaryKey: string;
  recommendations: PortfolioInsightRecommendationShape[];
  metrics: PortfolioInsightMetricDto[];
  context: PortfolioInsightContextDto;

  constructor(data: PortfolioInsightDtoShape) {
    this.status = data.status;
    this.score = data.score;
    this.titleKey = data.titleKey;
    this.summaryKey = data.summaryKey;
    this.recommendations = data.recommendations;
    this.metrics = data.metrics.map((metric) => new PortfolioInsightMetricDto(metric));
    this.context = new PortfolioInsightContextDto(data.context);
  }
}
