import { assetsApi } from '@entities/assets';
import { AssetCandlesQueryDtoShape } from '@packages/types';
import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

export const useGetAssetCandles = (symbol: string, query?: AssetCandlesQueryDtoShape) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetCandles(symbol, query),
    queryFn: () => assetsApi.getAssetCandles(symbol, query),
  });
};
