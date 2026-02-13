import { GetTransactionsDtoShape, TableResponse, TransactionDtoShape } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getTransactions = async (dto?: GetTransactionsDtoShape) => {
  const res = await restService.GET<TableResponse<TransactionDtoShape>>('/transactions/', {
    params: dto,
  });

  return res.data;
};

export const createKeyGetTransactions = (dto?: GetTransactionsDtoShape) => {
  return ['transactions', dto?.assetId, dto?.type, dto?.amount, dto?.quantity, dto?.currencyCode];
};

export const useGetTransactions = (dto?: GetTransactionsDtoShape) => {
  return useQuery({
    queryKey: createKeyGetTransactions(dto),
    queryFn: () => getTransactions(dto),
  });
};
