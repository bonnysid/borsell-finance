import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from '@packages/types';
import { Repository } from 'typeorm';

import { PortfolioAssetEntity } from '../entities';

@Injectable()
export class PortfolioAssetService {
  constructor(
    @InjectRepository(PortfolioAssetEntity)
    private readonly portfolioAssetRepo: Repository<PortfolioAssetEntity>,
  ) {}

  async createPortfolioAsset(portfolioId: ID, userAssetId: ID): Promise<PortfolioAssetEntity> {
    const candidate = await this.portfolioAssetRepo.findOne({
      where: { portfolio: { id: portfolioId }, userAsset: { id: userAssetId } },
    });

    return (
      candidate ??
      this.portfolioAssetRepo.create({
        portfolio: { id: portfolioId },
        userAsset: { id: userAssetId },
      })
    );
  }

  async createPortfolioAssetAndSave(
    portfolioId: ID,
    userAssetId: ID,
  ): Promise<PortfolioAssetEntity> {
    const portfolioAsset = await this.createPortfolioAsset(portfolioId, userAssetId);
    return await this.portfolioAssetRepo.save(portfolioAsset);
  }

  async createAndSavePortfolioAsset(
    portfolioId: ID,
    userAssetId: ID,
  ): Promise<PortfolioAssetEntity> {
    const candidate = await this.portfolioAssetRepo.findOne({
      where: { portfolio: { id: portfolioId }, userAsset: { id: userAssetId } },
    });

    if (!candidate) {
      const portfolioAsset = this.portfolioAssetRepo.create({
        portfolio: { id: portfolioId },
        userAsset: { id: userAssetId },
      });

      return this.portfolioAssetRepo.save(portfolioAsset);
    }

    return candidate;
  }

  async createManyPortfolioAssetsAndSave(
    portfolioId: ID,
    userAssetIds: ID[],
  ): Promise<PortfolioAssetEntity[]> {
    const portfolioAssets: PortfolioAssetEntity[] = [];

    for (const userAssetId of userAssetIds) {
      const portfolioAsset = await this.createPortfolioAsset(portfolioId, userAssetId);

      portfolioAssets.push(portfolioAsset);
    }

    return await this.portfolioAssetRepo.save(portfolioAssets);
  }

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
