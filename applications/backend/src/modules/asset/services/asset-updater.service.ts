import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '@packages/types';
import { In, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { formatDateToSqlDate } from '@/common/utils/date.utils';
import { MoexService } from '@/modules/moex/moex.service';

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
    private readonly moexService: MoexService,
  ) {}

  @Cron('0 55 23 * * *')
  async handleDailyUpdateCron() {
    this.logger.log('⏰ Running daily asset price update cron...');
    await this.updateAllAssetsFromMoex();
  }

  async updateAllAssetsFromMoex() {
    this.logger.log('🚀 Start updating assets from MOEX...');

    const assets = await this.assetRepo.find({
      where: { metadata: { source: 'MOEX' } },
    });

    if (assets.length === 0) {
      this.logger.log('No MOEX assets to update.');
      return;
    }

    const tickers = assets.map((a) => a.symbol);
    await this.updateAssetsByTickers(tickers, assets);
  }

  async updateAssetsByTickers(tickers: string[], existingAssets: AssetEntity[] = []) {
    if (tickers.length === 0) return;

    if (existingAssets.length === 0) {
      existingAssets = await this.assetRepo.find({
        where: { symbol: In(tickers) },
      });
    }

    const chunkSize = 20;
    const historyItems: AssetPriceHistoryEntity[] = [];
    const assetsToSave: AssetEntity[] = [];

    for (let i = 0; i < tickers.length; i += chunkSize) {
      const chunk = tickers.slice(i, i + chunkSize);
      this.logger.log(`Fetching MOEX chunk ${i / chunkSize + 1}: ${chunk.join(', ')}`);

      try {
        const data = await this.moexService.getMarketData(chunk);

        const currentChunkAssets = existingAssets.filter((a) => chunk.includes(a.symbol));
        const assetIds = currentChunkAssets.map((a) => a.id);
        const prevDates = data.map((it) => it.prevDate).filter((d): d is Date => !!d);

        const existingHistory =
          assetIds.length > 0 && prevDates.length > 0
            ? await this.assetPriceHistoryRepo.find({
                where: {
                  asset: { id: In(assetIds) },
                  date: In(prevDates),
                },
                relations: ['asset'],
              })
            : [];

        for (const it of data) {
          let asset = existingAssets.find((a) => a.symbol === it.symbol);

          if (!asset) {
            asset = this.assetRepo.create({
              symbol: it.symbol,
              type: it.type ?? AssetType.STOCK,
              currencyCode: it.currencyCode,
            });
          }

          asset.name = String(it.name || it.shortName);
          asset.cachedMarketPrice = it.lastPrice.toFixed(8);
          asset.volume = it.volume?.toFixed(8) || '0';
          asset.changePercent24h = it.changePercent?.toFixed(2) || '0';
          asset.lastPriceUpdateAt = it.date;
          asset.metadata = {
            ...asset.metadata,
            isin: it.isin,
            ticker: it.symbol,
            lotSize: it.lotSize?.toFixed(8),
            shortName: it.shortName,
            source: 'MOEX',
          };

          assetsToSave.push(asset);

          if (it.prevDate && it.prevWaPrice && it.prevWaPrice.gt(0)) {
            const itPrevDateStr = formatDateToSqlDate(it.prevDate);
            const prevHistoryItem = existingHistory.find((h) => {
              return h.asset?.id === asset?.id && formatDateToSqlDate(h.date) === itPrevDateStr;
            });

            if (prevHistoryItem) {
              if (!prevHistoryItem.closePrice || Number(prevHistoryItem.closePrice) === 0) {
                prevHistoryItem.closePrice = it.prevWaPrice.toFixed(8);
                historyItems.push(prevHistoryItem);
              }
            } else {
              historyItems.push(
                this.assetPriceHistoryRepo.create({
                  asset,
                  currencyCode: asset.currencyCode,
                  date: it.prevDate,
                  closePrice: it.prevWaPrice.toFixed(8),
                  source: 'MOEX',
                }),
              );
            }
          }

          const historyItem = this.assetPriceHistoryRepo.create({
            asset,
            currencyCode: asset.currencyCode,
            date: it.date,
            closePrice: it.close.gt(0) ? it.close.toFixed(8) : it.lastPrice.toFixed(8),
            openPrice: it.open?.toFixed(8),
            highPrice: it.high?.toFixed(8),
            lowPrice: it.low?.toFixed(8),
            volume: it.volume?.toFixed(8),
            source: 'MOEX',
          });
          historyItems.push(historyItem);
        }
      } catch (error) {
        this.logger.error(`Error updating chunk ${chunk.join(', ')}`, error);
      }
    }

    if (assetsToSave.length > 0) {
      await this.assetRepo.save(assetsToSave);
    }
    if (historyItems.length > 0) {
      await this.assetPriceHistoryRepo.save(historyItems);
    }

    this.logger.log(`Update complete. Processed ${assetsToSave.length} assets.`);
  }

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
          asset.volume = String(price.regularMarketVolume?.toFixed(8) || '0');
          asset.changePercent24h = String(price.regularMarketChangePercent?.toFixed(2) || '0');
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
      asset.volume = String(price.regularMarketVolume?.toFixed(8) || '0');
      asset.changePercent24h = String(price.regularMarketChangePercent?.toFixed(2) || '0');
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
