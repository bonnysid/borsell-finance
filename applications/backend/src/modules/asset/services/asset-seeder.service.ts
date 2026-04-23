import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '@packages/types';
import { In, Repository } from 'typeorm';

import { normalizeDate } from '@/common';
import { MoexEtfService, MoexStockService } from '@/modules/moex/services';
import { SettingKey } from '@/modules/settings/entities';
import { SettingsService } from '@/modules/settings/services';

import { AssetEntity } from '../entities';
import { AssetUpdaterService } from './asset-updater.service';

@Injectable()
export class AssetSeederService implements OnModuleInit {
  private readonly logger = new Logger(AssetSeederService.name);

  private readonly initialTickers = ['SBER', 'GAZP', 'LKOH', 'NVTK', 'YDEX', 'ROSN', 'CHMF'];

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
    private readonly moexStockService: MoexStockService,
    private readonly moexEtfService: MoexEtfService,
    private readonly assetUpdaterService: AssetUpdaterService,
    private readonly settingsService: SettingsService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    this.logger.log('🚀 Start seeding or updating Asset Catalog...');

    const lastSyncSetting = await this.settingsService.getString(
      SettingKey.LAST_TOP_TICKERS_SYNC_AT,
    );

    const now = new Date();

    if (lastSyncSetting) {
      const lastSync = new Date(lastSyncSetting);
      const diffMs = now.getTime() - lastSync.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        this.logger.log(
          `🕒 Less than 24h since last top tickers sync (${diffHours.toFixed(1)}h). Skipping top tickers update.`,
        );
        return;
      }
    }

    await Promise.all([this.seedStocks(), this.seedEtfs()]);

    await this.settingsService.setRaw(SettingKey.LAST_TOP_TICKERS_SYNC_AT, now.toISOString());
  }

  private async seedStocks() {
    this.logger.log('Start seeding Stocks...');

    const topStocks = await this.moexStockService.getTopStocks();
    const topTickers = topStocks.map((it) => it.symbol);
    const tickers = [...new Set([...this.initialTickers, ...topTickers])];

    const existingAssets = await this.assetRepo.find({
      where: { symbol: In(tickers), type: AssetType.STOCK },
    });

    const today = normalizeDate(new Date());

    const symbolsToUpdate = tickers.filter((symbol) => {
      const asset = existingAssets.find((a) => a.symbol === symbol);
      if (!asset) return true;
      return asset.lastPriceUpdateAt < today;
    });

    if (symbolsToUpdate.length <= 0) {
      this.logger.log('✅ All stock up to date.');
    } else {
      this.logger.log(
        `Updating or seeding ${symbolsToUpdate.length} stocks: ${symbolsToUpdate.join(', ')}`,
      );

      await this.assetUpdaterService.updateAssetsByTickers(
        symbolsToUpdate,
        existingAssets,
        topStocks,
        AssetType.STOCK,
      );
    }
  }

  private async seedEtfs() {
    this.logger.log('Start seeding ETFs...');

    const topEtfs = await this.moexEtfService.getTopEtfs();
    const topTickers = topEtfs.map((it) => it.symbol);
    const tickers = [...new Set([...topTickers])];

    const existingAssets = await this.assetRepo.find({
      where: { symbol: In(tickers), type: AssetType.ETF },
    });

    const today = normalizeDate(new Date());

    const symbolsToUpdate = tickers.filter((symbol) => {
      const asset = existingAssets.find((a) => a.symbol === symbol);
      if (!asset) return true;
      return asset.lastPriceUpdateAt < today;
    });

    if (symbolsToUpdate.length <= 0) {
      this.logger.log('✅ All etfs up to date.');
    } else {
      this.logger.log(
        `Updating or seeding ${symbolsToUpdate.length} etfs: ${symbolsToUpdate.join(', ')}`,
      );

      await this.assetUpdaterService.updateAssetsByTickers(
        symbolsToUpdate,
        existingAssets,
        topEtfs,
        AssetType.ETF,
      );
    }
  }
}
