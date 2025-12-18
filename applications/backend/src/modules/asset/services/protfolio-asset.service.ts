import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PortfolioAssetEntity } from '@/modules/asset';

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
