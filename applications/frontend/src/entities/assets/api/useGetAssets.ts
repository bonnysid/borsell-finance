import { ASSETS_QUERY_KEYS, AssetsListQuery } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useGetAssets = (params?: AssetsListQuery) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetsList(params),
    queryFn: () => assetsApi.getAssets(params),
  });
};
