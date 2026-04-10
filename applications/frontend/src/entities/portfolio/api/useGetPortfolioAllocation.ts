import { PortfolioAllocationDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolioAllocation = async () => {
  const res = await restService.GET<PortfolioAllocationDtoShape | null>('/portfolio/allocation');

  return res.data;
};

export const useGetPortfolioAllocation = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.allocation(),
    queryFn: getPortfolioAllocation,
  });
};
