import { PortfolioDtoShape } from '@packages/types';
import { PORTFOLIO_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolio = async () => {
  const res = await restService.GET<PortfolioDtoShape | null>('/portfolio/');

  return res.data;
};

export const useGetPortfolio = () => {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEYS.all,
    queryFn: getPortfolio,
  });
};
