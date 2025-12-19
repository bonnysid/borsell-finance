import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetEntity } from '../entities';

@Injectable()
export class PortfolioAssetService {
  constructor(
    @InjectRepository(PortfolioAssetEntity)
    private readonly portfolioAssetRepo: Repository<PortfolioAssetEntity>,
  ) {}

  async getPortfolioAssets(userId: string, portfolioId: string): Promise<PortfolioAssetEntity[]> {
    return this.portfolioAssetRepo.find({
      where: {
        portfolio: { id: portfolioId },
        userAsset: {
          user: { id: userId },
        },
      },
    });
  }
}
