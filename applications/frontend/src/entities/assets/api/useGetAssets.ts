import { AssetDtoShape, TableResponse } from '@packages/types';
import { restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

const getAssets = async () => {
  const res = await restService.GET<TableResponse<AssetDtoShape>>('/assets');

  return res.data;
};

export const createKeyGetAssets = () => {
  return ['assets'];
};

export const useGetAssets = () => {
  return useQuery({
    queryKey: createKeyGetAssets(),
    queryFn: getAssets,
  });
};
