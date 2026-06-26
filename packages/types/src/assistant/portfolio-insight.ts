import { CurrencyCode } from '../currency';

export type PortfolioHealthStatus = 'good' | 'average' | 'bad';

export type PortfolioInsightMetricShape = {
  labelKey: string;
  value: string;
  tone: PortfolioHealthStatus;
};

export type PortfolioInsightRecommendationShape = {
  key: string;
  params?: Record<string, string | number>;
};

export type PortfolioInsightContextShape = {
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
};

export type PortfolioInsightDtoShape = {
  status: PortfolioHealthStatus;
  score: number;
  titleKey: string;
  summaryKey: string;
  recommendations: PortfolioInsightRecommendationShape[];
  metrics: PortfolioInsightMetricShape[];
  context: PortfolioInsightContextShape;
  aiSummary?: string;
};

export type ChatSessionShape = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageStatus = 'pending' | 'done' | 'error';

export type ChatMessageShape = {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
};

export type AssistantPendingShape = {
  id: string;
  sessionId: string;
  sessionTitle: string;
};
