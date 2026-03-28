import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { assetsApi } from './AssetsApi';

export const useGetUserAsset = (symbol: string) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.userAsset(symbol),
    queryFn: () => assetsApi.getUserAssetBySymbol(symbol),
    enabled: !!symbol,
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
