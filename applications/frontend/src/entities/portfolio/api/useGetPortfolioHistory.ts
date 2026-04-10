import { PortfolioHistoryDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolioHistory = async () => {
  const res = await restService.GET<PortfolioHistoryDtoShape | null>('/portfolio/history');

  return res.data;
};

export const useGetPortfolioHistory = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.history(),
    queryFn: getPortfolioHistory,
  });
};
