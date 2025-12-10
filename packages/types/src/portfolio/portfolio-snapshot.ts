import { DateString, ID } from '../shared';

export type PortfolioSnapshotDtoShape = {
  id: ID;
  portfolioId: ID;
  snapshotDate: DateString;
  totalValue: number;
  totalInvested: number;
  totalWithdrawn: number;
  unrealizedGainLoss: number;
};
