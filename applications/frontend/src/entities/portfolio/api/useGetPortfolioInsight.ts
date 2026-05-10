import { PortfolioInsightDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolioInsight = async () => {
  const res = await restService.GET<PortfolioInsightDtoShape | null>('/portfolio/insight');

  return res.data;
};

export const useGetPortfolioInsight = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.insight(),
    queryFn: getPortfolioInsight,
  });
};
