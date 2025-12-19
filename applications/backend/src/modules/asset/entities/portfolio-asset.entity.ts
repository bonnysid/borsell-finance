import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PortfolioEntity } from '@/modules/portfolio/entities';

import { UserAssetEntity } from './user-asset.entity';

@Entity('portfolio_assets')
export class PortfolioAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserAssetEntity,
    (userAsset) => userAsset.portfolioAssets,
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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
