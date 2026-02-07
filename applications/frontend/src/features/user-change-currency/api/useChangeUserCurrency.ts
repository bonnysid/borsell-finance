import { createKeyGetAssets, createKeyGetUserAssets } from '@entities/assets';
import { createKeyUseGetPortfolio } from '@entities/portfolio';
import { createKeyUseGetMe } from '@entities/user';
import { ChangeCurrencyDtoShape, UserDtoShape } from '@packages/types';
import { queryClient, restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const changeUserCurrency = async (dto: ChangeCurrencyDtoShape) => {
  const res = await restService.PATCH<UserDtoShape, ChangeCurrencyDtoShape>('users/me/currency', {
    data: dto,
  });

  return res.data;
};

export const useChangeUserCurrency = () => {
  return useMutation({
    mutationKey: ['change-user-currency'],
    mutationFn: changeUserCurrency,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: createKeyGetUserAssets() });
      await queryClient.invalidateQueries({ queryKey: createKeyUseGetPortfolio() });
      await queryClient.invalidateQueries({ queryKey: createKeyGetAssets() });
      await queryClient.invalidateQueries({ queryKey: createKeyUseGetMe() });
    },
  });
};
