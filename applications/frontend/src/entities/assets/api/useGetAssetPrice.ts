import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useGetAssetPrice = (symbol?: string) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetPrice(symbol!),
    queryFn: () => assetsApi.getAssetPrice(symbol!),
    enabled: Boolean(symbol),
  });
};
