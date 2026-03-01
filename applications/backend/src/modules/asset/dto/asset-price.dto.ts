import { AssetPriceDtoShape, CurrencyCode, DateString, NumberString } from '@packages/types';

export class AssetPriceDto implements AssetPriceDtoShape {
  symbol: string;
  currentPrice: NumberString;
  previousPrice: NumberString;
  currencyCode: CurrencyCode;
  change: NumberString;
  changePercent: NumberString;
  lastUpdateAt: DateString;

  constructor(assetPriceInfo: AssetPriceDtoShape) {
    this.symbol = assetPriceInfo.symbol;
    this.currentPrice = assetPriceInfo.currentPrice;
    this.previousPrice = assetPriceInfo.previousPrice;
    this.currencyCode = assetPriceInfo.currencyCode;
    this.change = assetPriceInfo.change;
    this.changePercent = assetPriceInfo.changePercent;
    this.lastUpdateAt = assetPriceInfo.lastUpdateAt;
  }
}
