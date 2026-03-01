import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetPriceTimeframe } from '@packages/types';
import { Between, ILike, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { formatDateToSqlDate, isSameDay } from '@/common/utils/date.utils';
import { HolidayService } from '@/modules/holiday/services/holiday.service';
import { MoexService } from '@/modules/moex/moex.service';

import { AssetCandlesQueryDto, AssetHistoryQueryDto } from '../dto';
import { AssetEntity, AssetPriceHistoryEntity } from '../entities';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);
  private readonly yahooFinance = new YahooFinance();

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    @InjectRepository(AssetPriceHistoryEntity)
    private readonly assetPriceHistoryRepo: Repository<AssetPriceHistoryEntity>,
    private readonly moexService: MoexService,
    private readonly holidayService: HolidayService,
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

  async findOne(symbol: string): Promise<AssetEntity | null> {
    return this.assetRepo.findOne({ where: { symbol } });
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
      }
    } catch (e) {
      this.logger.error(`Failed to fetch and update asset info from MOEX for ${symbol}`, e);
    }

    // Получаем последнюю запись из истории (это может быть сегодняшний день, если рынок открыт, или вчерашний)
    // Нам нужна цена ПРЕДЫДУЩЕГО закрытого дня для расчета изменения.
    const history = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { symbol },
        timeframe: AssetPriceTimeframe.DAY,
      },
      order: { date: 'DESC' },
      take: 2,
    });

    const currentPrice = Number.parseFloat(asset.cachedMarketPrice);
    let previousPrice = currentPrice;
    let change = 0;
    let changePercent = 0;

    if (history.length > 0) {
      // Если у нас есть история, то:
      // Если первая запись в истории (самая свежая) - это СЕГОДНЯ, то берем вторую запись как "предыдущий день".
      // Если первая запись - это ВЧЕРА (или раньше), то берем её как "предыдущий день".

      const latestHistoryDate = new Date(history[0].date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      latestHistoryDate.setHours(0, 0, 0, 0);

      if (latestHistoryDate.getTime() === today.getTime() && history.length > 1) {
        previousPrice = Number.parseFloat(history[1].closePrice);
      } else {
        previousPrice = Number.parseFloat(history[0].closePrice);
      }

      change = currentPrice - previousPrice;
      changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
    }

    return {
      symbol: asset.symbol,
      currentPrice: asset.cachedMarketPrice,
      previousPrice: previousPrice.toFixed(8),
      currencyCode: asset.currencyCode,
      change: change.toFixed(8),
      changePercent: changePercent.toFixed(2),
      lastUpdateAt: asset.lastPriceUpdateAt,
    };
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
    const asset = await this.assetRepo.findOne({ where: { symbol: symbol } });
    if (!asset) {
      throw new NotFoundException(`Asset with symbol ${symbol} not found`);
    }

    const endDate = new Date(formatDateToSqlDate(to || new Date()));
    const startDate = new Date(
      formatDateToSqlDate(from || new Date(new Date().setDate(endDate.getDate() - 30))),
    );

    const localHistory = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { symbol: symbol },
        timeframe,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (localHistory.length < diffDays - 2) {
      this.logger.log(
        `Fetching history for ${asset.symbol} from MOEX for period ${startDate.toISOString()} - ${endDate.toISOString()}`,
      );

      try {
        const fromStr = formatDateToSqlDate(startDate);
        const toStr = formatDateToSqlDate(endDate);

        const moexHistory = await this.moexService.getAssetHistory(asset.symbol, fromStr, toStr);

        const newEntities: AssetPriceHistoryEntity[] = [];

        for (const record of moexHistory) {
          // Проверяем, нет ли уже такой записи в БД по дате и таймфрейму
          const exists = localHistory.find((h) => isSameDay(h.date, record.date));

          if (!exists) {
            const historyEntry = this.assetPriceHistoryRepo.create({
              asset,
              timeframe,
              date: record.date,
              openPrice: record.open.toFixed(8),
              highPrice: record.high.toFixed(8),
              lowPrice: record.low.toFixed(8),
              closePrice: record.close.toFixed(8),
              volume: record.volume.toFixed(8),
              currencyCode: record.currencyCode,
              source: 'MOEX',
            });
            newEntities.push(historyEntry);
          }
        }

        if (newEntities.length > 0) {
          await this.assetPriceHistoryRepo.save(newEntities);

          // Возвращаем обновленный список
          return this.assetPriceHistoryRepo.find({
            where: {
              asset: { symbol: symbol },
              timeframe,
              date: Between(startDate, endDate),
            },
            order: { date: 'ASC' },
          });
        }
      } catch (e) {
        this.logger.error(`Failed to fetch history from MOEX for ${asset.symbol}`, e);
      }
    }

    return localHistory;
  }

  async getAssetPriceCandles(symbol: string, { candles = 500 }: AssetCandlesQueryDto) {
    const asset = await this.assetRepo.findOne({ where: { symbol: symbol } });

    if (!asset) {
      throw new NotFoundException(`Asset with symbol ${symbol} not found`);
    }

    const timeframe = AssetPriceTimeframe.DAY;

    // Сначала ищем в базе
    const localHistory = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { symbol: symbol },
        timeframe,
      },
      order: { date: 'DESC' },
      take: candles,
    });

    // Проверка на валидность данных (отсутствие дырок)
    let isDataValid = true;
    if (localHistory.length > 0) {
      const sortedLocal = [...localHistory].sort((a, b) => a.date.getTime() - b.date.getTime());
      for (let i = 0; i < sortedLocal.length - 1; i++) {
        const currentDate = sortedLocal[i].date;
        const nextDate = sortedLocal[i + 1].date;

        const diffTime = Math.abs(nextDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Если разница больше 1 дня, проверяем, не выходные или праздничные ли это дни
        if (diffDays > 1) {
          let hasGap = false;
          for (let d = 1; d < diffDays; d++) {
            const checkDate = new Date(currentDate.getTime() + d * 24 * 60 * 60 * 1000);
            const isDayOff = await this.holidayService.isDayOff(checkDate);

            if (!isDayOff) {
              hasGap = true;
              break;
            }
          }

          if (hasGap) {
            this.logger.warn(
              `Found gap in local history for ${symbol} between ${currentDate.toISOString()} and ${nextDate.toISOString()}`,
            );
            isDataValid = false;
            break;
          }
        }
      }
    }

    // Если данных меньше, чем нужно ИЛИ есть пропуски - фетчим из MOEX
    if (localHistory.length < candles || !isDataValid) {
      this.logger.log(
        `Insufficient or invalid local candles for ${symbol} (found ${localHistory.length}, valid: ${isDataValid}, requested ${candles}). Fetching from MOEX.`,
      );

      try {
        const moexCandles = await this.moexService.getAssetPriceCandles(asset.symbol, candles);

        const newEntities: AssetPriceHistoryEntity[] = [];
        const updatedEntities: AssetPriceHistoryEntity[] = [];

        for (const record of moexCandles) {
          // Проверяем, нет ли уже такой записи в БД по дате
          const exists = localHistory.find((h) => isSameDay(h.date, record.date));

          if (!exists) {
            const historyEntry = this.assetPriceHistoryRepo.create({
              asset,
              timeframe,
              date: record.date,
              openPrice: record.open.toFixed(8),
              highPrice: record.high.toFixed(8),
              lowPrice: record.low.toFixed(8),
              closePrice: record.close.toFixed(8),
              volume: record.volume.toFixed(8),
              currencyCode: record.currencyCode,
              source: 'MOEX',
            });
            newEntities.push(historyEntry);
          } else {
            exists.openPrice = record.open.toFixed(8);
            exists.highPrice = record.high.toFixed(8);
            exists.lowPrice = record.low.toFixed(8);
            exists.closePrice = record.close.toFixed(8);
            exists.volume = record.volume.toFixed(8);

            updatedEntities.push(exists);
          }
        }

        if (updatedEntities.length > 0) {
          await this.assetPriceHistoryRepo.save(updatedEntities);
        }

        if (newEntities.length > 0) {
          await this.assetPriceHistoryRepo.save(newEntities);

          // После сохранения перечитываем данные, чтобы вернуть актуальный список нужной длины
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
