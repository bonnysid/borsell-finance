import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import YahooFinance from 'yahoo-finance2';

import { AssetEntity } from '../entities';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);
  private readonly yahooFinance = new YahooFinance();

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
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

  async getStockPrice(ticker: string) {
    try {
      const quote = await this.yahooFinance.quote(ticker);
      return quote.regularMarketPrice;
    } catch (e) {
      console.error(`Error fetching ${ticker}`, e);
      return null;
    }
  }
}
