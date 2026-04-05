import { useCreateTransaction } from '@entities/transaction';
import { CurrencyCode, ID, TransactionType } from '@packages/types';
import { ASSETS_QUERY_KEYS, queryClient } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

type BuyAssetDto = {
  assetId: ID;
  symbol: string;
  quantity: number;
  price: number;
  currencyCode?: CurrencyCode;
};

export const useBuyAsset = () => {
  const createTransactionMutation = useCreateTransaction();

  return useMutation({
    mutationKey: ASSETS_QUERY_KEYS.buyAsset(),
    mutationFn: (dto: BuyAssetDto) =>
      createTransactionMutation.mutateAsync({
        ...dto,
        type: TransactionType.BUY,
      }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEYS.userAssetsList() }),
        queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEYS.userAsset(variables.symbol) }),
      ]);
    },
  });
};
