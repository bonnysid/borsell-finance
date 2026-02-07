import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { AssetEntity, AssetPriceHistoryEntity } from '../entities';

@Injectable()
export class AssetUpdaterService {
  private readonly logger = new Logger(AssetUpdaterService.name);
  private readonly yahooFinance = new YahooFinance({
    suppressNotices: ['yahooSurvey'],
  });

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetPriceHistoryEntity)
    private readonly assetPriceHistoryRepo: Repository<AssetPriceHistoryEntity>,
  ) {}

  async update() {
    const now = new Date();

    this.logger.log('Updating Asset Catalog from Yahoo Finance...');

    const assets = await this.assetRepo.find();

    if (assets.length === 0) {
      this.logger.log('No assets to update.');
      return;
    }

    if (assets[0] && now.getTime() - assets[0].updatedAt.getTime() < 1000 * 60 * 60 * 24) {
      this.logger.log('Assets were updated less than 24 hours ago. Skipping updating...');
      return;
    }

    const historyItems: AssetPriceHistoryEntity[] = [];

    for (const asset of assets) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const summary = await this.yahooFinance.quoteSummary(asset.symbol, {
          modules: ['price', 'assetProfile'],
        });

        const price = summary.price;

        if (!price) {
          this.logger.warn(`No data for ${asset.symbol}, skipped`);
        } else {
          const cachedPrice = String(price.regularMarketPrice?.toFixed(8));

          const assetHistoryItem = this.assetPriceHistoryRepo.create({
            asset,
            currencyCode: asset.currencyCode,
            date: price.regularMarketTime?.toISOString() ?? new Date().toISOString(),
            closePrice: cachedPrice,
            openPrice: String(price.regularMarketOpen?.toFixed(8)),
            highPrice: String(price.regularMarketDayHigh?.toFixed(8)),
            lowPrice: String(price.regularMarketDayLow?.toFixed(8)),
            volume: String(price.regularMarketVolume?.toFixed(8)),
            source: 'yahoo-finance',
          });

          asset.cachedMarketPrice = cachedPrice;
          asset.lastPriceUpdateAt = price.regularMarketTime ?? new Date();
          historyItems.push(assetHistoryItem);
        }
      } catch (e) {
        this.logger.error(`Failed to update asset: ${asset.symbol}`);
        this.logger.error(e);
      }
    }

    await this.assetRepo.save(assets);
    await this.assetPriceHistoryRepo.save(historyItems);

    this.logger.log(`Updated complete. Updated ${assets.length} assets.`);
  }

  async updateBySymbol(symbol: string) {
    const asset = await this.assetRepo.findOneBy({ symbol });

    if (!asset) {
      this.logger.warn(`Asset with symbol ${symbol} not found`);
      return;
    }

    try {
      const summary = await this.yahooFinance.quoteSummary(asset.symbol, {
        modules: ['price', 'assetProfile'],
      });

      const price = summary.price;

      if (!price) {
        this.logger.warn(`No data for ${asset.symbol}, skipped`);
        return;
      }

      const cachedPrice = String(price.regularMarketPrice?.toFixed(8));

      const assetHistoryItem = this.assetPriceHistoryRepo.create({
        asset,
        currencyCode: asset.currencyCode,
        date: price.regularMarketTime?.toISOString() ?? new Date().toISOString(),
        closePrice: cachedPrice,
        openPrice: String(price.regularMarketOpen?.toFixed(8)),
        highPrice: String(price.regularMarketDayHigh?.toFixed(8)),
        lowPrice: String(price.regularMarketDayLow?.toFixed(8)),
        volume: String(price.regularMarketVolume?.toFixed(8)),
        source: 'yahoo-finance',
      });

      asset.cachedMarketPrice = cachedPrice;
      asset.lastPriceUpdateAt = price.regularMarketTime ?? new Date();

      await this.assetRepo.save(asset);
      await this.assetPriceHistoryRepo.save(assetHistoryItem);

      this.logger.log(`Updated asset: ${asset.symbol}`);
    } catch (e) {
      this.logger.error(`Failed to update asset: ${asset.symbol}`);
      this.logger.error(e);
    }
  }
}
