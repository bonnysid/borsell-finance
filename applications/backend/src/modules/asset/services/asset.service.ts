import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetPriceTimeframe, ID } from '@packages/types';
import { Between, ILike, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { MoexService } from '@/modules/moex/moex.service';

import { AssetHistoryQueryDto } from '../dto';
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

  async findOne(id: ID): Promise<AssetEntity | null> {
    return this.assetRepo.findOne({ where: { id } });
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
    assetId: ID,
    { from, to, timeframe = AssetPriceTimeframe.DAY }: AssetHistoryQueryDto,
  ): Promise<AssetPriceHistoryEntity[]> {
    const asset = await this.assetRepo.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset with id ${assetId} not found`);
    }

    const endDate = to || new Date();
    const startDate = from || new Date(new Date().setDate(endDate.getDate() - 30));

    const localHistory = await this.assetPriceHistoryRepo.find({
      where: {
        asset: { id: assetId },
        timeframe,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });

    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (localHistory.length < diffDays) {
      this.logger.log(
        `Fetching history for ${asset.symbol} from MOEX for period ${startDate.toISOString()} - ${endDate.toISOString()}`,
      );

      try {
        const fromStr = startDate.toISOString().split('T')[0];
        const toStr = endDate.toISOString().split('T')[0];

        const moexHistory = await this.moexService.getAssetHistory(asset.symbol, fromStr, toStr);

        const newEntities: AssetPriceHistoryEntity[] = [];

        for (const record of moexHistory) {
          // Проверяем, нет ли уже такой записи в БД по дате и таймфрейму
          const exists = localHistory.find(
            (h) => h.date.toISOString().split('T')[0] === record.date.toISOString().split('T')[0],
          );

          if (!exists) {
            const historyEntry = this.assetPriceHistoryRepo.create({
              asset,
              timeframe,
              date: record.date,
              openPrice: record.open,
              highPrice: record.high,
              lowPrice: record.low,
              closePrice: record.close,
              volume: record.volume,
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
              asset: { id: assetId },
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
}
