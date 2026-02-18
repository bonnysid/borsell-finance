import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MoexService } from '@/modules/moex/moex.service';
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
    private readonly moexService: MoexService,
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

    const topTickers = await this.moexService.getTopTickers(100);
    const tickers = [...new Set([...this.initialTickers, ...topTickers])];

    const existingAssets = await this.assetRepo.find({
      where: { symbol: In(tickers) },
    });

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const symbolsToUpdate = tickers.filter((symbol) => {
      const asset = existingAssets.find((a) => a.symbol === symbol);
      if (!asset) return true;
      return asset.lastPriceUpdateAt < today;
    });

    if (symbolsToUpdate.length <= 0) {
      this.logger.log('✅ Asset Catalog already seeded and up to date.');
    } else {
      this.logger.log(
        `Updating or seeding ${symbolsToUpdate.length} assets: ${symbolsToUpdate.join(', ')}`,
      );

      await this.assetUpdaterService.updateAssetsByTickers(symbolsToUpdate, existingAssets);
    }

    await this.settingsService.setRaw(SettingKey.LAST_TOP_TICKERS_SYNC_AT, now.toISOString());
  }
}
