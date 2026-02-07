import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '@packages/types';
import { Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { AssetEntity, AssetPriceHistoryEntity } from '../entities';

export const DEFAULT_ASSETS: Array<{ symbol: string; type: AssetType }> = [
  // =======================
  // US Stocks (Large Cap / Popular)
  // =======================
  { symbol: 'AAPL', type: AssetType.STOCK },
  { symbol: 'MSFT', type: AssetType.STOCK },
  { symbol: 'NVDA', type: AssetType.STOCK },
  { symbol: 'AMZN', type: AssetType.STOCK },
  { symbol: 'GOOGL', type: AssetType.STOCK },
  { symbol: 'META', type: AssetType.STOCK },
  { symbol: 'TSLA', type: AssetType.STOCK },
  { symbol: 'BRK-B', type: AssetType.STOCK },
  { symbol: 'JPM', type: AssetType.STOCK },
  { symbol: 'V', type: AssetType.STOCK },
  { symbol: 'MA', type: AssetType.STOCK },
  { symbol: 'UNH', type: AssetType.STOCK },
  { symbol: 'XOM', type: AssetType.STOCK },
  { symbol: 'LLY', type: AssetType.STOCK },
  { symbol: 'AVGO', type: AssetType.STOCK },
  { symbol: 'COST', type: AssetType.STOCK },
  { symbol: 'WMT', type: AssetType.STOCK },
  { symbol: 'HD', type: AssetType.STOCK },
  { symbol: 'KO', type: AssetType.STOCK },
  { symbol: 'PEP', type: AssetType.STOCK },
  { symbol: 'DIS', type: AssetType.STOCK },
  { symbol: 'NFLX', type: AssetType.STOCK },
  { symbol: 'ORCL', type: AssetType.STOCK },
  { symbol: 'ADBE', type: AssetType.STOCK },
  { symbol: 'CRM', type: AssetType.STOCK },
  { symbol: 'INTC', type: AssetType.STOCK },
  { symbol: 'AMD', type: AssetType.STOCK },
  { symbol: 'QCOM', type: AssetType.STOCK },
  { symbol: 'CSCO', type: AssetType.STOCK },
  { symbol: 'TMO', type: AssetType.STOCK },

  // =======================
  // ETFs (broad market / sectors)
  // =======================
  { symbol: 'SPY', type: AssetType.ETF },
  { symbol: 'VOO', type: AssetType.ETF },
  { symbol: 'VTI', type: AssetType.ETF },
  { symbol: 'QQQ', type: AssetType.ETF },
  { symbol: 'DIA', type: AssetType.ETF },
  { symbol: 'IWM', type: AssetType.ETF },
  { symbol: 'SCHD', type: AssetType.ETF },
  { symbol: 'ARKK', type: AssetType.ETF },
  { symbol: 'XLK', type: AssetType.ETF },
  { symbol: 'XLF', type: AssetType.ETF },
  { symbol: 'XLE', type: AssetType.ETF },
  { symbol: 'XLY', type: AssetType.ETF },

  // =======================
  // Crypto (Yahoo format)
  // =======================
  { symbol: 'BTC-USD', type: AssetType.CRYPTO },
  { symbol: 'ETH-USD', type: AssetType.CRYPTO },
  { symbol: 'BNB-USD', type: AssetType.CRYPTO },
  { symbol: 'SOL-USD', type: AssetType.CRYPTO },
  { symbol: 'XRP-USD', type: AssetType.CRYPTO },
  { symbol: 'ADA-USD', type: AssetType.CRYPTO },
  { symbol: 'DOGE-USD', type: AssetType.CRYPTO },

  // =======================
  // Russia (MOEX) — обычно .ME
  // =======================
  // { symbol: 'SBER.ME', type: AssetType.STOCK }, // Сбербанк
  // { symbol: 'GAZP.ME', type: AssetType.STOCK }, // Газпром
  // { symbol: 'LKOH.ME', type: AssetType.STOCK }, // Лукойл
  // { symbol: 'ROSN.ME', type: AssetType.STOCK }, // Роснефть
  // { symbol: 'NVTK.ME', type: AssetType.STOCK }, // Новатэк
  // { symbol: 'TATN.ME', type: AssetType.STOCK }, // Татнефть
  // { symbol: 'YDEX.ME', type: AssetType.STOCK }, // Яндекс (на MOEX может отличаться, см. ниже)
  // { symbol: 'GMKN.ME', type: AssetType.STOCK }, // Норникель
  // { symbol: 'ALRS.ME', type: AssetType.STOCK }, // Алроса
  // { symbol: 'MTSS.ME', type: AssetType.STOCK }, // МТС
  // { symbol: 'MGNT.ME', type: AssetType.STOCK }, // Магнит
  // { symbol: 'PLZL.ME', type: AssetType.STOCK }, // Полюс
];

@Injectable()
export class AssetSeederService implements OnModuleInit {
  private readonly logger = new Logger(AssetSeederService.name);
  private readonly yahooFinance = new YahooFinance({
    suppressNotices: ['yahooSurvey'],
  });

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetPriceHistoryEntity)
    private readonly assetPriceHistoryRepo: Repository<AssetPriceHistoryEntity>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const count = await this.assetRepo.count();

    if (count > 0) {
      this.logger.log('Asset Catalog already seeded. Skipping.');

      return;
    }

    this.logger.log('Seeding Asset Catalog from Yahoo Finance...');

    const assetsToInsert: AssetEntity[] = [];
    const historyItems: AssetPriceHistoryEntity[] = [];

    for (const item of DEFAULT_ASSETS) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const summary = await this.yahooFinance.quoteSummary(item.symbol, {
          modules: ['price', 'assetProfile'],
        });

        const price = summary.price;

        if (!price) {
          this.logger.warn(`No data for ${item.symbol}, skipped`);
        } else {
          const asset = this.assetRepo.create({
            cachedMarketPrice: price.regularMarketPrice?.toFixed(8),
            lastPriceUpdateAt: price.regularMarketTime?.toISOString() ?? new Date().toISOString(),
            symbol: price.symbol,
            type: item.type,
            name: price.shortName ?? item.symbol,
            currencyCode: price.currency ?? 'USD',
          });

          const assetHistoryItem = this.assetPriceHistoryRepo.create({
            asset,
            currencyCode: asset.currencyCode,
            date: price.regularMarketTime?.toISOString() ?? new Date().toISOString(),
            closePrice: String(price.regularMarketPrice?.toFixed(8)),
            openPrice: String(price.regularMarketOpen?.toFixed(8)),
            highPrice: String(price.regularMarketDayHigh?.toFixed(8)),
            lowPrice: String(price.regularMarketDayLow?.toFixed(8)),
            volume: String(price.regularMarketVolume?.toFixed(8)),
            source: 'yahoo-finance',
          });

          assetsToInsert.push(asset);
          historyItems.push(assetHistoryItem);
        }
      } catch (error) {
        this.logger.error(`Failed to fetch ${item.symbol}: ${error.message}`);
      }
    }

    await this.assetRepo.save(assetsToInsert);
    await this.assetPriceHistoryRepo.save(historyItems);

    this.logger.log(`Seeding complete. Added ${assetsToInsert.length} assets.`);
  }
}
