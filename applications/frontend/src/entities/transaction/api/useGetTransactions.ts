import { GetTransactionsDtoShape, TableResponse, TransactionDtoShape } from '@packages/types';
import { restService, TRANSACTIONS_QUERY_KEYS } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getTransactions = async (dto?: GetTransactionsDtoShape) => {
  const res = await restService.GET<TableResponse<TransactionDtoShape>>('/transactions/', {
    params: dto,
  });

  return res.data;
};

export const useGetTransactions = (dto?: GetTransactionsDtoShape) => {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.list(dto),
    queryFn: () => getTransactions(dto),
  });
};
