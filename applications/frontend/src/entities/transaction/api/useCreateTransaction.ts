import { CreateTransactionDtoShape } from '@packages/types';
import { queryClient, restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

import { createKeyGetTransactions } from './useGetTransactions';

const createTransaction = async (dto: CreateTransactionDtoShape) => {
  const response = await restService.POST('/transactions/', {
    data: dto,
  });

  return response.data;
};

export const useCreateTransaction = () => {
  return useMutation({
    mutationKey: ['create-transaction'],
    mutationFn: createTransaction,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: createKeyGetTransactions() });
    },
  });
};
