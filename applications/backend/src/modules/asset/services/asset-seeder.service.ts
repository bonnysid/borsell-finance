import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MoexService } from '@/modules/moex/moex.service';

import { AssetEntity } from '../entities';
import { AssetUpdaterService } from './asset-updater.service';

@Injectable()
export class AssetSeederService implements OnModuleInit {
  private readonly logger = new Logger(AssetSeederService.name);

  private readonly initialTickers = ['SBER', 'GAZP', 'LKOH', 'NVTK', 'YNDX', 'ROSN', 'CHMF'];

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    private readonly moexService: MoexService,
    private readonly assetUpdaterService: AssetUpdaterService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('🚀 Start seeding or updating Asset Catalog...');

    const topTickers = await this.moexService.getTopTickers(100);
    const tickers = [...new Set([...this.initialTickers, ...topTickers])];

    const existingAssets = await this.assetRepo.find({
      where: { symbol: In(tickers) },
    });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const symbolsToUpdate = tickers.filter((symbol) => {
      const asset = existingAssets.find((a) => a.symbol === symbol);
      if (!asset) return true;
      return asset.lastPriceUpdateAt < oneDayAgo;
    });

    if (symbolsToUpdate.length <= 0) {
      this.logger.log('✅ Asset Catalog already seeded and up to date. Skipping.');
      return;
    }

    this.logger.log(
      `Updating or seeding ${symbolsToUpdate.length} assets: ${symbolsToUpdate.join(', ')}`,
    );

    await this.assetUpdaterService.updateAssetsByTickers(symbolsToUpdate, existingAssets);
  }
}
