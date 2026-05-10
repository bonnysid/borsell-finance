import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

import { assetsApi } from './AssetsApi';

export const useSearchAssets = (search: string, limit = 8) => {
  const normalizedSearch = search.trim();

  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.search(normalizedSearch, limit),
    queryFn: () => assetsApi.searchAssets(normalizedSearch, limit),
    enabled: normalizedSearch.length >= 2,
    staleTime: 60_000,
  });
};
