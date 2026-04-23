import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '@packages/types';
import { subYears } from 'date-fns';
import { In, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { formatDateToSqlDate } from '@/common';
import { MoexAssetInfo } from '@/modules/moex/moex.types';
import { MoexEtfService, MoexStockService } from '@/modules/moex/services';

import { AssetEntity, AssetPriceHistoryEntity } from '../entities';
import { AssetService } from './asset.service';

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
    private readonly moexStockService: MoexStockService,
    private readonly moexEtfsService: MoexEtfService,
    private readonly assetService: AssetService,
  ) {}

  @Cron('0 55 23 * * *')
  async handleDailyUpdateCron() {
    this.logger.log('⏰ Running daily asset price update cron...');
    await this.updateAllAssetsFromMoex();
  }

  async fillHistoryForThreeYears() {
    this.logger.log('Starting history fill for all assets for 3 years...');
    const assets = await this.assetRepo.find();

    const toDate = new Date();
    const fromDate = subYears(toDate, 3);

    for (const asset of assets) {
      // Пока что работаем только с MOEX, так как Yahoo имеет свои лимиты и формат
      if (!asset.symbol.includes('.') && asset.currencyCode === 'RUB') {
        try {
          const history = await this.moexStockService.getStockCandles(asset.symbol, {
            isFromTo: true,
            from: fromDate,
            to: toDate,
          });

          if (history.length > 0) {
            const historyToUpdate: Partial<AssetPriceHistoryEntity>[] = history.map((record) => ({
              date: formatDateToSqlDate(record.date),
              openPrice: record.open.toFixed(8),
              highPrice: record.high.toFixed(8),
              lowPrice: record.low.toFixed(8),
              closePrice: record.close.toFixed(8),
              volume: record.volume.toFixed(8),
              currencyCode: record.currencyCode,
              source: 'MOEX',
            }));

            await this.assetService.updateAssetHistory(asset, historyToUpdate);
            this.logger.log(`Updated ${history.length} records for ${asset.symbol}`);
          } else {
            this.logger.warn(`No history found for ${asset.symbol}`);
          }

          // Delay to avoid MOEX rate limits if any
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          this.logger.error(`Failed to fill history for ${asset.symbol}`, error);
        }
      } else {
        this.logger.debug(`Skipping non-MOEX or non-RUB asset: ${asset.symbol}`);
      }
    }

    this.logger.log('Finished history fill for all assets.');
  }

  async updateAllAssetsFromMoex() {
    this.logger.log('🚀 Start updating assets from MOEX...');

    const assets = await this.assetRepo
      .createQueryBuilder('asset')
      .where("asset.metadata->>'source' = :source", { source: 'MOEX' })
      .getMany();

    this.logger.log(`Found ${assets.length} assets with MOEX source.`);

    if (assets.length === 0) {
      this.logger.log('No MOEX assets to update.');
      return;
    }

    const tickers = assets.map((a) => a.symbol);
    await this.updateAssetsByTickers(tickers, assets);
  }

  async getTickersInfo(tickers: string[], type: AssetType) {
    if (type === AssetType.STOCK) {
      return this.moexStockService.getStocksInfo(tickers);
    }

    if (type === AssetType.ETF) {
      return this.moexEtfsService.getEtfsInfo(tickers);
    }

    return [];
  }

  async updateAssetsByTickers(
    tickers: string[],
    existingAssets: AssetEntity[] = [],
    assetsInfo: MoexAssetInfo[] = [],
    type = AssetType.STOCK,
  ) {
    if (tickers.length === 0) return;

    if (existingAssets.length === 0) {
      existingAssets = await this.assetRepo.find({
        where: { symbol: In(tickers), type },
      });
    }

    const tickersToFetch = assetsInfo.length
      ? tickers.filter((it) => !assetsInfo.find((asset) => asset.symbol === it))
      : tickers;
    const chunkSize = 20;
    const assetsToSave: AssetEntity[] = [];

    for (let i = 0; i < tickersToFetch.length; i += chunkSize) {
      const chunk = tickersToFetch.slice(i, i + chunkSize);
      this.logger.log(`Fetching MOEX chunk ${i / chunkSize + 1}: ${chunk.join(', ')}`);

      try {
        this.logger.log(`Fetching MOEX chunk ${i / chunkSize + 1}: ${chunk.join(', ')}`);
        const data = await this.getTickersInfo(chunk, type);

        assetsInfo = assetsInfo ? [...assetsInfo, ...data] : data;
      } catch (error) {
        this.logger.error(`Error updating chunk ${chunk.join(', ')}`, error);
      }
    }

    for (const it of tickers) {
      let asset = existingAssets.find((a) => a.symbol === it);
      const assetInfo = assetsInfo.find((a) => a.symbol === it);

      if (!assetInfo) {
        this.logger.error(`Error updating asset: ${it}, asset info not found`);
        continue;
      }

      if (!asset) {
        asset = this.assetRepo.create({
          symbol: assetInfo.symbol,
          type: assetInfo.type ?? type,
          currencyCode: assetInfo.currencyCode,
        });
      }

      asset.name = String(assetInfo.name || assetInfo.shortName);
      asset.cachedMarketPrice = assetInfo.lastPrice.toFixed(8);
      asset.volume = assetInfo.volume?.toFixed(8) || '0';
      asset.changePercent24h = assetInfo.changePercent?.toFixed(2) || '0';
      asset.lastPriceUpdateAt = assetInfo.date;
      asset.metadata = {
        ...asset.metadata,
        isin: assetInfo.isin,
        ticker: assetInfo.symbol,
        lotSize: assetInfo.lotSize?.toFixed(8),
        shortName: assetInfo.shortName,
        source: 'MOEX',
      };

      if (!assetsToSave.find((a) => a.symbol === asset.symbol)) {
        assetsToSave.push(asset);
      }
    }

    if (assetsToSave.length > 0) {
      await this.assetRepo.save(assetsToSave);
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

          const historyToUpdate: Partial<AssetPriceHistoryEntity>[] = [
            {
              currencyCode: asset.currencyCode,
              date: formatDateToSqlDate(price.regularMarketTime ?? new Date()),
              closePrice: cachedPrice,
              openPrice: String(price.regularMarketOpen?.toFixed(8)),
              highPrice: String(price.regularMarketDayHigh?.toFixed(8)),
              lowPrice: String(price.regularMarketDayLow?.toFixed(8)),
              volume: String(price.regularMarketVolume?.toFixed(8)),
              source: 'yahoo-finance',
            },
          ];

          await this.assetService.updateAssetHistory(asset, historyToUpdate);

          asset.cachedMarketPrice = cachedPrice;
          asset.volume = String(price.regularMarketVolume?.toFixed(8) || '0');
          asset.changePercent24h = String(price.regularMarketChangePercent?.toFixed(2) || '0');
          asset.lastPriceUpdateAt = price.regularMarketTime ?? new Date();

          await this.assetRepo.save(asset);
        }
      } catch (e) {
        this.logger.error(`Failed to update asset: ${asset.symbol}`);
        this.logger.error(e);
      }
    }

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

      const historyToUpdate: Partial<AssetPriceHistoryEntity>[] = [
        {
          currencyCode: asset.currencyCode,
          date: formatDateToSqlDate(price.regularMarketTime ?? new Date()),
          closePrice: cachedPrice,
          openPrice: String(price.regularMarketOpen?.toFixed(8)),
          highPrice: String(price.regularMarketDayHigh?.toFixed(8)),
          lowPrice: String(price.regularMarketDayLow?.toFixed(8)),
          volume: String(price.regularMarketVolume?.toFixed(8)),
          source: 'yahoo-finance',
        },
      ];

      await this.assetService.updateAssetHistory(asset, historyToUpdate);

      asset.cachedMarketPrice = cachedPrice;
      asset.volume = String(price.regularMarketVolume?.toFixed(8) || '0');
      asset.changePercent24h = String(price.regularMarketChangePercent?.toFixed(2) || '0');
      asset.lastPriceUpdateAt = price.regularMarketTime ?? new Date();

      await this.assetRepo.save(asset);

      this.logger.log(`Updated asset: ${asset.symbol}`);
    } catch (e) {
      this.logger.error(`Failed to update asset: ${asset.symbol}`);
      this.logger.error(e);
    }
  }
}
