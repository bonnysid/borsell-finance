import { AssetDtoShape } from '../asset';
import { CurrencyCode } from '../currency';
import { PaginationDtoShape } from '../response';
import { DateString, ID, NumberString } from '../shared';

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export type TransactionDtoShape = {
  id: ID;
  userAssetId: ID;
  asset?: AssetDtoShape;
  type: TransactionType;
  quantity: NumberString;
  amount: NumberString;
  price: NumberString;
  currencyCode: CurrencyCode;
  executedAt: DateString;
  createdAt: DateString;
};

export type GetTransactionsDtoShape = PaginationDtoShape & {
  assetId?: ID;
  amount?: number;
  quantity?: number;
  currencyCode?: CurrencyCode;
  type?: TransactionType;
};

export type CreateTransactionDtoShape = {
  assetId: ID;
  currencyCode?: CurrencyCode;
  type: TransactionType;
  quantity: number;
  price: number;
};
