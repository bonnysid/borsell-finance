import { PortfolioSummaryDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolioSummary = async () => {
  const res = await restService.GET<PortfolioSummaryDtoShape | null>('/portfolio/summary');

  return res.data;
};

export const useGetPortfolioSummary = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.summary(),
    queryFn: getPortfolioSummary,
  });
};
