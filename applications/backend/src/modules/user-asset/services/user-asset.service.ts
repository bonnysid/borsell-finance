import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from '@packages/types';
import { DeleteResult, In, Repository } from 'typeorm';

import { UserAssetEntity } from '../entities';

@Injectable()
export class UserAssetService {
  constructor(
    @InjectRepository(UserAssetEntity)
    private readonly userAssetRepo: Repository<UserAssetEntity>,
  ) {}

  async getUserAssets(userId: ID): Promise<UserAssetEntity[]> {
    return this.userAssetRepo.find({ where: { user: { id: userId } }, relations: ['asset'] });
  }

  async getUserAsset(userId: ID, assetId: ID): Promise<UserAssetEntity | null> {
    return this.userAssetRepo.findOne({
      where: { id: assetId, user: { id: userId } },
      relations: ['asset'],
    });
  }

  async getUserAssetBySymbol(userId: ID, symbol: string): Promise<UserAssetEntity | null> {
    return this.userAssetRepo.findOne({
      where: { asset: { symbol }, user: { id: userId } },
      relations: ['asset'],
    });
  }

  async getUserAssetsByIds(userId: ID, ids: ID[]): Promise<UserAssetEntity[]> {
    return this.userAssetRepo.find({
      where: { user: { id: userId }, id: In(ids) },
      relations: ['asset'],
    });
  }

  async deleteUserAsset(userId: ID, userAssetId: ID): Promise<DeleteResult> {
    return await this.userAssetRepo.delete({ user: { id: userId }, id: userAssetId });
  }
}
