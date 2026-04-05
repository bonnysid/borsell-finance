import { ChangeCurrencyDtoShape, UserDtoShape } from '@packages/types';
import {
  ASSETS_QUERY_KEYS,
  PORTFOLIO_QUERY_KEYS,
  USER_QUERY_KEYS,
  queryClient,
  restService,
} from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const changeUserCurrency = async (dto: ChangeCurrencyDtoShape) => {
  const res = await restService.PATCH<UserDtoShape, ChangeCurrencyDtoShape>('users/me/currency', {
    data: dto,
  });

  return res.data;
};

export const useChangeUserCurrency = () => {
  return useMutation({
    mutationKey: USER_QUERY_KEYS.changeCurrency(),
    mutationFn: changeUserCurrency,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEYS.userAssetsList() });
      await queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEYS.all });
      await queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEYS.assetsList() });
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.me() });
    },
  });
};
