export type PortfolioSnapshotDtoShape = {
  id: string;
  portfolioId: string;
  snapshotDate: string;
  totalValue: number;
  totalInvested: number;
  totalWithdrawn: number;
  unrealizedGainLoss: number;
};
