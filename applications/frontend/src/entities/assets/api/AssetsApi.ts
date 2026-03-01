import {
  AssetCandlesQueryDtoShape,
  AssetDtoShape,
  AssetPriceDtoShape,
  AssetPriceHistoryDtoShape,
  AssetPriceHistoryQueryDtoShape,
  ID,
  TableResponse,
  UserAssetDtoShape,
} from '@packages/types';
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

  getAssetPriceHistory = async (symbol: string, query?: AssetPriceHistoryQueryDtoShape) => {
    const res = await restService.GET<AssetPriceHistoryDtoShape[]>(`/assets/${symbol}/history`, {
      params: query,
    });

    return res.data;
  };

  getAssetCandles = async (symbol: string, query?: AssetCandlesQueryDtoShape) => {
    const res = await restService.GET<AssetPriceHistoryDtoShape[]>(`/assets/${symbol}/candles`, {
      params: query,
    });

    return res.data;
  };

  getAssetInfo = async (symbol: string) => {
    const res = await restService.GET<AssetDtoShape>(`/assets/${symbol}`);

    return res.data;
  };

  getAssetPrice = async (symbol: string) => {
    const res = await restService.GET<AssetPriceDtoShape>(`/assets/${symbol}/price`);

    return res.data;
  };
}

export const assetsApi = new AssetsApi();
