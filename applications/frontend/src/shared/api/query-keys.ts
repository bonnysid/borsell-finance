import {
  AssetCandlesQueryDtoShape,
  AssetPriceHistoryQueryDtoShape,
  AssetType,
  GetTransactionsDtoShape,
  PaginationDtoShape,
  SearchDtoShape,
} from '@packages/types';

export type AssetsListQuery = PaginationDtoShape & SearchDtoShape & { type?: AssetType };

export const ASSETS_QUERY_KEYS = {
  all: ['assets'] as const,
  lists: () => [...ASSETS_QUERY_KEYS.all, 'list'] as const,
  userAssetsList: () => [...ASSETS_QUERY_KEYS.lists(), 'user-assets'] as const,
  userAsset: (symbol: string) => [...ASSETS_QUERY_KEYS.all, 'user-asset', symbol] as const,
  assetsList: (params?: AssetsListQuery) =>
    [...ASSETS_QUERY_KEYS.lists(), 'assets', params] as const,
  search: (search: string, limit?: number) =>
    [...ASSETS_QUERY_KEYS.all, 'search', search, limit] as const,

  assetInfo: (symbol: string) => [...ASSETS_QUERY_KEYS.all, 'info', symbol] as const,
  assetPrice: (symbol: string) => [...ASSETS_QUERY_KEYS.all, 'price', symbol] as const,

  assetPriceHistory: (symbol: string, query?: AssetPriceHistoryQueryDtoShape) =>
    [...ASSETS_QUERY_KEYS.all, 'history', symbol, query] as const,
  assetCandles: (symbol: string, query?: AssetCandlesQueryDtoShape) =>
    [...ASSETS_QUERY_KEYS.all, 'candles', symbol, query] as const,

  deleteUserAsset: () => [...ASSETS_QUERY_KEYS.all, 'delete'] as const,
  buyAsset: () => [...ASSETS_QUERY_KEYS.all, 'buy'] as const,
  sellAsset: () => [...ASSETS_QUERY_KEYS.all, 'sell'] as const,
  transferAsset: () => [...ASSETS_QUERY_KEYS.all, 'transfer'] as const,
} as const;

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,

  signIn: () => [...AUTH_QUERY_KEYS.all, 'sign-in'] as const,
  signUp: () => [...AUTH_QUERY_KEYS.all, 'sign-up'] as const,
  logout: () => [...AUTH_QUERY_KEYS.all, 'logout'] as const,
  refreshToken: () => [...AUTH_QUERY_KEYS.all, 'refresh-token'] as const,
  refreshSession: () => [...AUTH_QUERY_KEYS.all, 'refresh-session'] as const,
};

export const TRANSACTIONS_QUERY_KEYS = {
  all: ['transactions'] as const,
  create: () => [...TRANSACTIONS_QUERY_KEYS.all, 'create'] as const,
  lists: () => [...TRANSACTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (dto?: GetTransactionsDtoShape) =>
    [
      ...TRANSACTIONS_QUERY_KEYS.lists(),
      dto?.assetId,
      dto?.type,
      dto?.amount,
      dto?.quantity,
      dto?.currencyCode,
      dto?.page,
      dto?.limit,
    ] as const,
} as const;

export const PORTFOLIO_QUERY_KEYS = {
  all: ['portfolio'] as const,
  summary: () => [...PORTFOLIO_QUERY_KEYS.all, 'summary'] as const,
  allocation: () => [...PORTFOLIO_QUERY_KEYS.all, 'allocation'] as const,
  history: () => [...PORTFOLIO_QUERY_KEYS.all, 'history'] as const,
  insight: () => [...PORTFOLIO_QUERY_KEYS.all, 'insight'] as const,
} as const;


export const USER_QUERY_KEYS = {
  all: ['user'] as const,
  me: () => [...USER_QUERY_KEYS.all, 'me'] as const,
  changePassword: () => [...USER_QUERY_KEYS.all, 'change-password'] as const,
  changeCurrency: () => [...USER_QUERY_KEYS.all, 'change-currency'] as const,
} as const;

export const CURRENCIES_QUERY_KEYS = {
  all: ['currencies'] as const,
} as const;
