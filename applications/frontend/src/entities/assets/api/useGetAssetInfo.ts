import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useGetAssetInfo = (symbol?: string) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetInfo(symbol!),
    queryFn: () => assetsApi.getAssetInfo(symbol!),
    enabled: Boolean(symbol),
  });
};
