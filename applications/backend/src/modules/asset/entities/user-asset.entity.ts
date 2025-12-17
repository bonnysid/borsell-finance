import { CurrencyCode, NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PriceColumn, QuantityColumn } from '@/database/columns';
import { UserAssetOperationEntity } from '@/modules/asset/entities/user-asset-operation.entity';
import { CurrencyCodeColumn, CurrencyEntity, CurrencyRelationColumn } from '@/modules/currency';
import { UserEntity } from '@/modules/user';

import { AssetEntity } from './asset.entity';
import { PortfolioAssetEntity } from './portfolio-asset.entity';

@Entity('user_assets')
export class UserAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.assets,
    { onDelete: 'CASCADE' },
  )
  user: UserEntity;

  @OneToMany(
    () => PortfolioAssetEntity,
    (asset) => asset.userAsset,
  )
  portfolioAssets: PortfolioAssetEntity[];

  @OneToMany(
    () => UserAssetOperationEntity,
    (asset) => asset.userAsset,
  )
  operations: UserAssetOperationEntity[];

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @QuantityColumn()
  quantity: NumberString;

  @PriceColumn()
  avgBuyPrice: NumberString;

  @PriceColumn()
  costBasis: NumberString;

  @PriceColumn()
  totalInvested: NumberString;

  @PriceColumn()
  totalWithdrawn: NumberString;

  @PriceColumn()
  realizedPnl: NumberString;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
