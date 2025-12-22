import { CurrencyDtoShape } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getAllCurrencies = async () => {
  const res = await restService.GET<CurrencyDtoShape[]>('/currency/all');

  return res.data;
};

export const useGetAllCurrencies = () => {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: getAllCurrencies,
  });
};
