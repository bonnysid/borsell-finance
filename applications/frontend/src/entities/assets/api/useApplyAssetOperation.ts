import { ApplyAssetOperationDtoShape } from '@packages/types';
import { queryClient, restService } from '@shared/api';
import { useMutation } from '@tanstack/react-query';

import { createKeyGetUserAssets } from './useGetUserAssets';

const applyAssetOperation = async (dto: ApplyAssetOperationDtoShape) => {
  const response = await restService.POST('/assets/apply/operation', {
    data: dto,
  });

  return response.data;
};

export const useApplyAssetOperation = () => {
  return useMutation({
    mutationKey: ['apply-asset-operation'],
    mutationFn: applyAssetOperation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: createKeyGetUserAssets() });
    },
  });
};
