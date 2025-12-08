import { AssetMetadata } from './metadata';

export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
  CSGO_SKIN = 'CSGO_SKIN',
  CASH = 'CASH',
}

export type AssetDtoShape = {
  id: string;
  portfolioId: string;
  currencyCode: string;
  type: AssetType;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  metadata: AssetMetadata;
  cachedMarketPrice: number;
  lastPriceUpdateAt: string;
  createdAt: string;
  updatedAt: string;
};
