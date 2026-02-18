import { AssetPriceHistoryQueryDtoShape } from '@packages/types';

export const ASSETS_QUERY_KEYS = {
  all: ['assets'] as const,
  lists: () => [...ASSETS_QUERY_KEYS.all, 'list'] as const,
  userAssetsList: () => [...ASSETS_QUERY_KEYS.lists(), 'user-assets'] as const,
  assetsList: () => [...ASSETS_QUERY_KEYS.lists(), 'assets'] as const,

  assetPriceHistory: (symbol: string, query?: AssetPriceHistoryQueryDtoShape) =>
    [...ASSETS_QUERY_KEYS.all, 'history', symbol, query] as const,

  deleteUserAsset: () => [...ASSETS_QUERY_KEYS.all, 'delete'] as const,
} as const;

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,

  signIn: () => [...AUTH_QUERY_KEYS.all, 'sign-in'] as const,
  signUp: () => [...AUTH_QUERY_KEYS.all, 'sign-up'] as const,
  logout: () => [...AUTH_QUERY_KEYS.all, 'logout'] as const,
  refreshToken: () => [...AUTH_QUERY_KEYS.all, 'refresh-token'] as const,
};
