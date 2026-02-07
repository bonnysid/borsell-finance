import { PortfolioDtoShape } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getPortfolio = async () => {
  const res = await restService.GET<PortfolioDtoShape | null>('/portfolio/');

  return res.data;
};

export const createKeyUseGetPortfolio = () => ['portfolio'];

export const useGetPortfolio = () => {
  return useQuery({
    queryKey: createKeyUseGetPortfolio(),
    queryFn: getPortfolio,
  });
};
