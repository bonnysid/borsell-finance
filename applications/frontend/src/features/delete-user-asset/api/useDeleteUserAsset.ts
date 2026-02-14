import { assetsApi } from '@entities/assets';
import { ASSETS_QUERY_KEYS, queryClient } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

export const useDeleteUserAsset = () => {
  return useMutation({
    mutationKey: ASSETS_QUERY_KEYS.deleteUserAsset(),
    mutationFn: assetsApi.deleteUserAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEYS.userAssetsList() });
    },
  });
};
