import { PortfolioInsightDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getPortfolioInsight = async (refresh = false) => {
  const res = await restService.GET<PortfolioInsightDtoShape | null>('/portfolio/insight', {
    params: refresh ? { refresh: 'true' } : undefined,
  });
  return res.data;
};

export const useGetPortfolioInsight = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.insight(),
    queryFn: () => getPortfolioInsight(false),
  });
};

export const useRefreshPortfolioInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getPortfolioInsight(true),
    onSuccess: (data) => {
      queryClient.setQueryData(PORTFOLIO_QUERY_KEYS.insight(), data);
    },
  });
};
