import { CreateTransactionDtoShape } from '@packages/types';
import {
  PORTFOLIO_QUERY_KEYS,
  queryClient,
  restService,
  TRANSACTIONS_QUERY_KEYS,
} from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const createTransaction = async (dto: CreateTransactionDtoShape) => {
  const response = await restService.POST('/transactions/', {
    data: dto,
  });

  return response.data;
};

export const useCreateTransaction = () => {
  return useMutation({
    mutationKey: TRANSACTIONS_QUERY_KEYS.create(),
    mutationFn: createTransaction,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.all });
    },
  });
};
