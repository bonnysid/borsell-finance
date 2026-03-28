import { PaginationDtoShape, SearchDtoShape } from '@packages/types';
import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useGetAssets = (params?: PaginationDtoShape & SearchDtoShape) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetsList(params),
    queryFn: () => assetsApi.getAssets(params),
  });
};
