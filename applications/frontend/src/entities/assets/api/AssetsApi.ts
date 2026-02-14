import { AssetDtoShape, ID, TableResponse, UserAssetDtoShape } from '@packages/types';
import { restService } from '@shared/api';

export class AssetsApi {
  deleteUserAsset = async (id: ID) => {
    return restService.DELETE(`/assets/${id}`);
  };

  getAssets = async () => {
    const res = await restService.GET<TableResponse<AssetDtoShape>>('/assets');

    return res.data;
  };

  getUserAssets = async () => {
    const res = await restService.GET<TableResponse<UserAssetDtoShape>>('/user-assets/');

    return res.data;
  };
}

export const assetsApi = new AssetsApi();
