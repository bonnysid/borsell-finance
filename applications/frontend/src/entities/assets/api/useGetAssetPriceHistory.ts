import { assetsApi } from '@entities/assets';
import { AssetPriceHistoryDtoShape } from '@packages/types';
import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

export const useGetAssetPriceHistory = (symbol: string, query?: AssetPriceHistoryDtoShape) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetPriceHistory(symbol, query),
    queryFn: () => assetsApi.getAssetPriceHistory(symbol, query),
  });
};
