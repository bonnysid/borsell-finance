import { DateString, ID, NumberString } from '../shared';

export type PortfolioSnapshotDtoShape = {
  id: ID;
  portfolioId: ID;
  snapshotDate: DateString;
  totalValue: NumberString;
  totalInvested: NumberString;
  totalWithdrawn: NumberString;
  unrealizedGainLoss: NumberString;
};
