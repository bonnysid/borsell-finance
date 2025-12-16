import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PortfolioEntity } from '@/modules/portfolio';

import { UserAssetEntity } from './user-asset.entity';

@Entity('portfolio_assets')
export class PortfolioAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserAssetEntity,
    (portfolio) => portfolio.portfolioAssets,
    { onDelete: 'CASCADE' },
  )
  userAsset: UserAssetEntity;

  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.assets,
    { onDelete: 'CASCADE' },
  )
  portfolio: PortfolioEntity;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
