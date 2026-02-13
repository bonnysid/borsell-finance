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

import { PriceColumn, QuantityColumn } from '@/common/columns';
import { AssetEntity } from '@/modules/asset/entities';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';
import { PortfolioAssetEntity } from '@/modules/portfolio/entities';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { UserEntity } from '@/modules/user/entities';

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
    () => TransactionEntity,
    (asset) => asset.userAsset,
  )
  transactions: TransactionEntity[];

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
