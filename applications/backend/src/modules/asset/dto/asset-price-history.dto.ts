import {
  AssetPriceHistoryDtoShape,
  AssetPriceTimeframe,
  CurrencyCode,
  DateString,
  ID,
  NumberString,
} from '@packages/types';

import { AssetPriceHistoryEntity } from '../entities';

export class AssetPriceHistoryDto implements AssetPriceHistoryDtoShape {
  id: ID;
  timeframe: AssetPriceTimeframe;
  assetId: ID;

  openPrice: NumberString;
  highPrice: NumberString;
  lowPrice: NumberString;
  closePrice: NumberString;
  volume: NumberString;

  currencyCode: CurrencyCode;
  source: string;

  date: DateString;
  createdAt: DateString;
  updatedAt: DateString;

  constructor(history: AssetPriceHistoryEntity) {
    this.id = history.id;
    this.timeframe = history.timeframe;
    this.assetId = history.asset?.id;

    this.openPrice = history.openPrice;
    this.highPrice = history.highPrice;
    this.lowPrice = history.lowPrice;
    this.closePrice = history.closePrice;
    this.volume = history.volume;

    this.currencyCode = history.currencyCode;
    this.source = history.source;

    this.date = history.date.toISOString();
    this.createdAt = history.createdAt.toISOString();
    this.updatedAt = history.updatedAt.toISOString();
  }
}
