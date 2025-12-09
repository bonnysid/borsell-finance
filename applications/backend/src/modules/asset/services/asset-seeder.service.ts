import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetType } from '@packages/types';
import { Repository } from 'typeorm';

import { AssetEntity } from '../entities';

@Injectable()
export class AssetCatalogSeederService implements OnModuleInit {
  private readonly logger = new Logger(AssetCatalogSeederService.name);

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepo: Repository<AssetEntity>,
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

    this.logger.log('Seeding Asset Catalog with default assets...');

    const initialAssets: Partial<AssetEntity>[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: AssetType.CRYPTO,
        metadata: {
          ticker: 'BTC',
          network: 'Bitcoin',
          iconUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        },
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        type: AssetType.CRYPTO,
        metadata: {
          ticker: 'ETH',
          network: 'Ethereum',
          iconUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        },
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        type: AssetType.CRYPTO,
        metadata: {
          ticker: 'USDT',
          network: 'TRC20/ERC20',
          iconUrl: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        },
      },

      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: AssetType.STOCK,
        metadata: {
          ticker: 'AAPL',
          exchange: 'NASDAQ',
          isin: 'US0378331005',
          sector: 'Technology',
        },
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        type: AssetType.STOCK,
        metadata: {
          ticker: 'TSLA',
          exchange: 'NASDAQ',
          isin: 'US88160R1014',
          sector: 'Automotive',
        },
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        type: AssetType.STOCK,
        metadata: {
          ticker: 'MSFT',
          exchange: 'NASDAQ',
          isin: 'US5949181045',
          sector: 'Technology',
        },
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        type: AssetType.STOCK,
        metadata: {
          ticker: 'NVDA',
          exchange: 'NASDAQ',
          isin: 'US67066G1040',
          sector: 'Semiconductors',
        },
      },

      {
        symbol: 'GAZP',
        name: 'Gazprom PAO',
        type: AssetType.STOCK,
        metadata: { ticker: 'GAZP', exchange: 'MOEX', isin: 'RU0007661625', sector: 'Energy' },
      },
      {
        symbol: 'SBER',
        name: 'Sberbank Rossii PAO',
        type: AssetType.STOCK,
        metadata: { ticker: 'SBER', exchange: 'MOEX', isin: 'RU0009029540', sector: 'Finance' },
      },
    ];

    await this.assetRepo.save(initialAssets);

    this.logger.log(`Seeding complete. Added ${initialAssets.length} assets.`);
  }
}
