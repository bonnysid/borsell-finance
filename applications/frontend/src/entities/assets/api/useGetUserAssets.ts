import { TableResponse, UserAssetDtoShape } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getUserAssets = async () => {
  const res = await restService.GET<TableResponse<UserAssetDtoShape>>('/assets/me');

  return res.data;
};

export const createKeyGetUserAssets = () => {
  return ['user-assets'];
};

export const useGetUserAssets = () => {
  return useQuery({
    queryKey: createKeyGetUserAssets(),
    queryFn: getUserAssets,
  });
};
