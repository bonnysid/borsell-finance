import { DateString, ID } from '../shared';
import { AssetMetadata } from './metadata';

export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
  CSGO_SKIN = 'CSGO_SKIN',
  CASH = 'CASH',
}

export type AssetDtoShape = {
  id: ID;
  type: AssetType;
  name: string;
  metadata: AssetMetadata;
  cachedMarketPrice: number;
  lastPriceUpdateAt: DateString;
  createdAt: DateString;
  updatedAt: DateString;
};
