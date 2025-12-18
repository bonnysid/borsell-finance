import { CurrencyCode, ID, NumberString, UserAssetOperationType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AmountColumn, DateColumn, QuantityColumn } from '@/common/columns';
import { UserAssetEntity } from '@/modules/asset';
import { CurrencyCodeColumn, CurrencyEntity, CurrencyRelationColumn } from '@/modules/currency';

@Entity('user_asset_operations')
@Index(['userAssetId', 'executedAt'])
export class UserAssetOperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userAssetId: ID;

  @ManyToOne(
    () => UserAssetEntity,
    (portfolio) => portfolio.operations,
  )
  @JoinColumn({ name: 'userAssetId' })
  userAsset: UserAssetEntity;

  @Column({ type: 'enum', enum: UserAssetOperationType })
  type: UserAssetOperationType;

  @QuantityColumn()
  quantity: NumberString;

  @AmountColumn()
  amount: NumberString;

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @DateColumn()
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
