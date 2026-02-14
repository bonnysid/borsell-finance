import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useGetAssets = () => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetsList(),
    queryFn: assetsApi.getAssets,
  });
};
