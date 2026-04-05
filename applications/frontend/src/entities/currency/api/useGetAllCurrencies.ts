import { CurrencyDtoShape } from '@packages/types';
import { CURRENCIES_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getAllCurrencies = async () => {
  const res = await restService.GET<CurrencyDtoShape[]>('/currency/all');

  return res.data;
};

export const useGetAllCurrencies = () => {
  return useQuery({
    queryKey: CURRENCIES_QUERY_KEYS.all,
    queryFn: getAllCurrencies,
  });
};
