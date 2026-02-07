import { createKeyGetUserAssets } from '@entities/assets';
import { createKeyUseGetPortfolio } from '@entities/portfolio';
import { ID } from '@packages/types';
import { queryClient, restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

const deleteUserAsset = (id: ID) => {
  return restService.DELETE(`/assets/${id}`);
};

export const createKeyDeleteUserAsset = () => ['delete-user-asset'];

export const useDeleteUserAsset = () => {
  return useMutation({
    mutationKey: createKeyDeleteUserAsset(),
    mutationFn: deleteUserAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: createKeyGetUserAssets() });
      queryClient.invalidateQueries({ queryKey: createKeyUseGetPortfolio() });
    },
  });
};
