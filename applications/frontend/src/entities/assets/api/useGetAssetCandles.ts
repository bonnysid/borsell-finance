import { assetsApi } from '@entities/assets';
import { AssetCandlesQueryDtoShape } from '@packages/types';
import { ASSETS_QUERY_KEYS } from '@shared/api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useGetAssetCandles = (symbol: string, query?: AssetCandlesQueryDtoShape) => {
  return useQuery({
    queryKey: ASSETS_QUERY_KEYS.assetCandles(symbol, query),
    queryFn: () => assetsApi.getAssetCandles(symbol, query),
  });
};

type CandlesPageParam = {
  from: string;
  to: string;
};

const CANDLES_PAGE_YEARS = 1;

const formatDateParam = (date: Date) => date.toISOString().split('T')[0];

const shiftYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

const getInitialPageParam = (): CandlesPageParam => {
  const to = new Date();
  const from = shiftYears(to, -CANDLES_PAGE_YEARS);

  return {
    from: formatDateParam(from),
    to: formatDateParam(to),
  };
};

const getPreviousPageParam = (pageParam: CandlesPageParam): CandlesPageParam => {
  const to = new Date(`${pageParam.from}T00:00:00.000Z`);
  to.setDate(to.getDate() - 1);
  const from = shiftYears(to, -CANDLES_PAGE_YEARS);

  return {
    from: formatDateParam(from),
    to: formatDateParam(to),
  };
};

export const useInfiniteAssetCandles = (symbol: string) => {
  return useInfiniteQuery({
    queryKey: [...ASSETS_QUERY_KEYS.all, 'candles-infinite', symbol, CANDLES_PAGE_YEARS] as const,
    initialPageParam: getInitialPageParam(),
    queryFn: ({ pageParam }) => assetsApi.getAssetCandles(symbol, pageParam),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      if (lastPage.length === 0) return undefined;

      return getPreviousPageParam(lastPageParam);
    },
  });
};
