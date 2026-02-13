import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PortfolioEntity } from '@/modules/portfolio/entities';
import { UserAssetEntity } from '@/modules/user-asset/entities';

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
