import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetPriceTimeframe, StockMetadata } from '@packages/types';
import { Between, ILike, In, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import {
  formatDateToSqlDate,
  getDaysDifference,
  isDataStale,
  isSameDay,
  normalizeDate,
} from '@/common/utils/date.utils';
import { MoexService } from '@/modules/moex/moex.service';
import { MoexAssetHistoryPrice } from '@/modules/moex/moex.types';
import { SettingsService } from '@/modules/settings/services';

import { AssetCandlesQueryDto, AssetHistoryQueryDto, AssetQueryDto } from '../dto';
import { AssetEntity, AssetPriceHistoryEntity } from '../entities';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);
  private readonly yahooFinance = new YahooFinance();
  private readonly PRICE_CACHE_TTL_MINUTES = 15;

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetPriceHistoryEntity)
    private readonly assetPriceHistoryRepo: Repository<AssetPriceHistoryEntity>,
    private readonly moexService: MoexService,
    private readonly settingsService: SettingsService,
  ) {}

  async searchAssets(query: string): Promise<AssetEntity[]> {
    // 1. Ищем в локальной БД
    const localResults = await this.assetRepo.find({
      where: [
        { symbol: ILike(`%${query}%`) }, // ILike - регистронезависимый поиск
        { name: ILike(`%${query}%`) },
      ],
      take: 10,
    });

    if (localResults.length > 0) {
      return localResults;
    }

    this.logger.log(`Fetching new assets from external API for query: ${query}`);

    // 2. Если пусто — ищем во внешнем мире (Псевдокод)
    // Это называется "On-demand population"
    /*
    const externalData = await this.externalApi.search(query);
    if (externalData) {
       const newAsset = this.catalogRepo.create({
          symbol: externalData.symbol,
          name: externalData.name,
          type: AssetType.CRYPTO,
          metadata: { ... }
       });
       return [await this.catalogRepo.save(newAsset)];
    }
    */

    return [];
  }

  async getAllAssets(): Promise<AssetEntity[]> {
    return this.assetRepo.find({});
  }

  async getAssetsPaginated(query: AssetQueryDto): Promise<[AssetEntity[], number]> {
    const { page = 1, limit = 10, search } = query;

    const [assets, count] = await this.assetRepo.findAndCount({
      where: search ? [{ symbol: ILike(`%${search}%`) }, { name: ILike(`%${search}%`) }] : {},
      take: limit,
      skip: (page - 1) * limit,
      order: { symbol: 'ASC' },
    });

    return [assets, count];
  }

  async getAssetsWithHistoryPaginated(
    query: AssetQueryDto,
  ): Promise<[Array<{ asset: AssetEntity; history: AssetPriceHistoryEntity[] }>, number]> {
    const [assets, count] = await this.getAssetsPaginated(query);

    const result: Array<{ asset: AssetEntity; history: AssetPriceHistoryEntity[] }> = [];

    for (const asset of assets) {
      const history = await this.getAssetHistory7Days(asset);

      // Calculate changePercent7d if history is available
      if (history.length >= 2) {
        const currentPrice = Number(asset.cachedMarketPrice);
        // history is ordered by date ASC, so the last item is the newest (today/yesterday)
        // and the first item is the oldest
        const oldestHistoryItem = history[0];
        const oldestPrice = Number(oldestHistoryItem.closePrice);

        if (oldestPrice > 0) {
          const change7d = ((currentPrice - oldestPrice) / oldestPrice) * 100;
          asset.changePercent7d = change7d.toFixed(2);
        }
      }

      result.push({ asset, history });
    }

    return [result, count];
  }

  async getAssetHistory7Days(asset: AssetEntity | string): Promise<AssetPriceHistoryEntity[]> {
    const assetEntity =
      typeof asset === 'string' ? await this.assetRepo.findOne({ where: { id: asset } }) : asset;

    if (!assetEntity) {
      throw new NotFoundException(`Asset not found`);
    }

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 7);

    return this.getAssetPriceHistory(assetEntity.symbol, {
      from: startDate,
      to: today,
      timeframe: AssetPriceTimeframe.DAY,
    });
  }

  async findOne(symbol: string): Promise<AssetEntity | null> {
    return this.assetRepo.findOne({ where: { symbol } });
  }

  async getAsset(ticker: string): Promise<AssetEntity | null> {
    // 1. Ищем актив в нашей БД
    let asset = await this.assetRepo.findOne({ where: { symbol: ticker } });

    // 2. Проверяем, протухли ли данные
    const now = new Date();
    const isStale =
      !asset ||
      !asset.lastPriceUpdateAt ||
      now.getTime() - asset.lastPriceUpdateAt.getTime() > this.PRICE_CACHE_TTL_MINUTES * 60 * 1000;

    // 3. Если данных нет или они старые — идем в MOEX
    if (isStale) {
      this.logger.log(`[Cache Miss/Stale] Fetching fresh data for ${ticker} from MOEX`);

      const moexData = await this.moexService.getAssetInfo(ticker);

      if (!moexData) {
        // Если это новый актив и его нет на MOEX, кидаем ошибку
        if (!asset) throw new Error(`Asset ${ticker} not found on MOEX`);
        // Если MOEX лежит, но у нас есть старые данные в БД — отдаем их (Graceful degradation)
        this.logger.warn(`MOEX is unavailable for ${ticker}. Serving stale data.`);
        return asset;
      }

      // 4. Обновляем или создаем сущность
      if (!asset) {
        asset = this.assetRepo.create({ symbol: ticker });
      }

      asset.type = moexData.type;
      asset.name = moexData.name || asset.name;
      // Сохраняем цену как строку (NumberString), так как у тебя Big.js
      asset.cachedMarketPrice = moexData.lastPrice.toString();
      asset.volume = moexData.volume.toString();
      asset.changePercent24h = moexData.changePercent.toString();
      asset.lastPriceUpdateAt = moexData.date;
      asset.currencyCode = moexData.currencyCode;

      // Складываем фундаментальные данные в JSONB
      asset.metadata = {
        ...asset.metadata,
        isin: moexData.isin,
        lotSize: moexData.lotSize ? Number(moexData.lotSize.toString()) : undefined,
        issueCapitalization: moexData.issueCapitalization?.toString(),
        valToday: moexData.valToday?.toString(),
      } as StockMetadata;

      // Сохраняем в БД
      asset = await this.assetRepo.save(asset);
    } else {
      this.logger.log(`[Cache Hit] Serving ${ticker} from DB`);
    }

    return asset;
  }

  async getAssetPriceWithChange(symbol: string) {
    const asset = await this.assetRepo.findOne({ where: { symbol } });

    if (!asset) {
      throw new NotFoundException(`Asset with symbol ${symbol} not found`);
    }

    try {
      const assetInfo = await this.moexService.getAssetInfo(symbol);

      if (assetInfo) {
        asset.cachedMarketPrice = assetInfo.lastPrice.toFixed(8);
        asset.lastPriceUpdateAt = assetInfo.date;
        await this.assetRepo.save(asset);

        const currentPrice = assetInfo.lastPrice;
        const openPrice = assetInfo.open;
        const change = currentPrice.minus(openPrice);
        const changePercent = change.div(openPrice).mul(100);

        return {
          symbol: asset.symbol,
          currentPrice: asset.cachedMarketPrice,
          previousPrice: openPrice.toFixed(8),
          currencyCode: asset.currencyCode,
          change: change.toFixed(8),
          changePercent: changePercent.toFixed(2),
          lastUpdateAt: asset.lastPriceUpdateAt,
        };
      }
    } catch (e) {
      this.logger.error(`Failed to fetch and update asset info from MOEX for ${symbol}`, e);
    }
  }

  async getStockPrice(ticker: string) {
    try {
      const quote = await this.yahooFinance.quote(ticker);
      return quote.regularMarketPrice;
    } catch (e) {
      console.error(`Error fetching ${ticker}`, e);
      return null;
    }
  }

  async getAssetPriceHistory(
    symbol: string,
    { from, to, timeframe = AssetPriceTimeframe.DAY }: AssetHistoryQueryDto,
  ): Promise<AssetPriceHistoryEntity[]> {
    this.logger.log(`Fetching history for asset ${symbol} from ${from} to ${to}`);

    const endDate = new Date(formatDateToSqlDate(to || new Date()));
    const startDate = new Date(
      formatDateToSqlDate(from || new Date(new Date().setDate(endDate.getDate() - 30))),
    );

    const diffDays = getDaysDifference(startDate, endDate);
    // Запрашиваем свечи (минимум diffDays + запас) через унифицированный метод
    await this.getAssetPriceCandles(symbol, { candles: Math.max(diffDays + 5, 10) });

    const history = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { symbol: symbol },
        timeframe,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    // Remove duplicates by date (keep only the last one for each day)
    const uniqueHistory: AssetPriceHistoryEntity[] = [];
    const seenDates = new Set<string>();

    for (const item of history) {
      const dateKey = formatDateToSqlDate(item.date);
      if (!seenDates.has(dateKey)) {
        uniqueHistory.push(item);
        seenDates.add(dateKey);
      } else {
        // If we found a duplicate, we replace the previous one to keep the "latest" in case they are not identical
        const index = uniqueHistory.findIndex((h) => formatDateToSqlDate(h.date) === dateKey);
        if (index !== -1) {
          uniqueHistory[index] = item;
        }
      }
    }

    return uniqueHistory;
  }

  async getAssetProfileAndStats(ticker: string) {
    // 1. Ищем актив в нашей базе данных
    let asset = await this.assetRepo.findOne({ where: { symbol: ticker } });

    // 2. Определяем, нужно ли идти в MOEX (нет в БД или данные устарели)
    // Акции торгуются днем, обновлять капитализацию раз в 1-4 часа вполне ок.
    const isStale = asset ? isDataStale(asset.updatedAt, 4) : true;

    if (!asset || isStale) {
      this.logger.log(`Cache miss or stale data for ${ticker}. Fetching from MOEX...`);

      // 3. Идем в MOEX через твой Http-клиент
      const moexData = await this.moexService.getAssetInfo(ticker);

      if (!moexData) {
        throw new Error(`Asset ${ticker} not found on MOEX`);
      }

      // 4. Сохраняем или обновляем запись в нашей БД
      asset = await this.assetRepo.save({
        ...(asset || {}), // Если актив был, обновляем, если нет - создаем
        symbol: moexData.symbol,
        name: moexData.name,
        shortName: moexData.shortName,
        lotSize: moexData.lotSize?.toNumber(),
        capitalization: moexData.issueCapitalization?.toString(),
        // ... маппинг остальных полей
        metadata: {},
        updatedAt: new Date(),
      });
    } else {
      this.logger.log(`Serving ${ticker} from local DB`);
    }

    return asset;
  }

  async updateAssetHistory(
    asset: AssetEntity,
    records: Partial<AssetPriceHistoryEntity>[],
  ): Promise<void> {
    if (records.length === 0) return;

    // Normalize dates to ensure 00:00:00 time
    for (const record of records) {
      if (record.date) {
        record.date = normalizeDate(record.date);
      }
    }

    const timeframe = records[0].timeframe ?? AssetPriceTimeframe.DAY;
    const dates = records.map((r) => r.date);

    // Find existing records for these dates and timeframe
    const existingRecords = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { id: asset.id },
        timeframe,
        date: In(dates),
      },
    });

    const entitiesToSave: AssetPriceHistoryEntity[] = [];

    for (const record of records) {
      const existing = existingRecords.find((e) => isSameDay(e.date, record.date));

      if (existing) {
        // Update existing record
        Object.assign(existing, record);
        entitiesToSave.push(existing);
      } else {
        // Create new record
        const newRecord = this.assetPriceHistoryRepo.create({
          ...record,
          asset,
          timeframe,
        });
        entitiesToSave.push(newRecord);
      }
    }

    if (entitiesToSave.length > 0) {
      await this.assetPriceHistoryRepo.save(entitiesToSave);
    }
  }

  async getAssetPriceCandles(symbol: string, { candles = 500 }: AssetCandlesQueryDto) {
    const asset = await this.assetRepo.findOne({ where: { symbol: symbol } });

    if (!asset) {
      throw new NotFoundException(`Asset with symbol ${symbol} not found`);
    }

    const timeframe = AssetPriceTimeframe.DAY;
    const lastUpdateKey = this.settingsService.getAssetCandlesLastUpdateKey(symbol);

    const localHistory = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { symbol: symbol },
        timeframe,
      },
      order: { date: 'DESC' },
      take: candles,
    });

    const today = new Date();

    const lastUpdateSetting = await this.settingsService.getRaw(lastUpdateKey);
    const lastUpdateAt = lastUpdateSetting ? new Date(lastUpdateSetting.value) : null;

    // We need update if:
    // 1. Never updated before
    // 2. Last update was not today
    // 3. We have fewer candles in DB than requested (even if updated today)
    const needsUpdate =
      !lastUpdateAt || !isSameDay(lastUpdateAt, today) || localHistory.length < candles;

    if (needsUpdate) {
      this.logger.log(
        `Checking for new candles for ${symbol}. Last date in DB: ${
          lastUpdateAt ? formatDateToSqlDate(lastUpdateAt) : 'none'
        }. In DB: ${localHistory.length}. Requested: ${candles}`,
      );

      try {
        let moexCandles: MoexAssetHistoryPrice[] = [];

        if (!lastUpdateAt || localHistory.length < candles) {
          // If we never updated OR we need more historical data than we have in DB
          moexCandles = await this.moexService.getAssetPriceCandles(asset.symbol, candles);
        } else {
          const diff = getDaysDifference(lastUpdateAt);

          if (diff >= 1) {
            moexCandles = await this.moexService.getAssetPriceCandles(asset.symbol, diff + 1);
          }
        }

        if (moexCandles.length > 0) {
          const historyToUpdate: Partial<AssetPriceHistoryEntity>[] = moexCandles.map((record) => ({
            date: record.date,
            openPrice: record.open.toFixed(8),
            highPrice: record.high.toFixed(8),
            lowPrice: record.low.toFixed(8),
            closePrice: record.close.toFixed(8),
            volume: record.volume.toFixed(8),
            currencyCode: record.currencyCode,
            source: 'MOEX',
          }));

          await this.updateAssetHistory(asset, historyToUpdate);

          await this.settingsService.setRaw(
            lastUpdateKey,
            new Date().toISOString(),
            `Last time candles were updated from MOEX for ${symbol}`,
          );

          // Если были изменения, перечитываем данные
          const updatedHistory = await this.assetPriceHistoryRepo.find({
            where: {
              asset: { symbol: symbol },
              timeframe,
            },
            order: { date: 'DESC' },
            take: candles,
          });

          return updatedHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
        }
      } catch (e) {
        this.logger.error(`Failed to fetch candles from MOEX for ${asset.symbol}`, e);
      }
    }

    // Возвращаем локальную историю, сортируя по возрастанию для графиков
    return localHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
