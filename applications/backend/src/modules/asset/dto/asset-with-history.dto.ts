import { AssetWithHistoryDtoShape } from '@packages/types';

import { AssetEntity, AssetPriceHistoryEntity } from '../entities';
import { AssetDto } from './asset.dto';
import { AssetPriceHistoryDto } from './asset-price-history.dto';

export class AssetWithHistoryDto extends AssetDto implements AssetWithHistoryDtoShape {
  history: AssetPriceHistoryDto[];

  constructor(asset: AssetEntity, history: AssetPriceHistoryEntity[]) {
    super(asset);
    this.history = history.map((h) => new AssetPriceHistoryDto(h));
  }
}
