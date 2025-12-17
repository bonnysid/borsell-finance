import { NumberString, UserAssetOperationType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AmountColumn, DateColumn, QuantityColumn } from '@/database/columns';
import { UserAssetEntity } from '@/modules/asset';

@Entity('user_asset_operations')
@Index(['userAssetId', 'executedAt'])
export class UserAssetOperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserAssetEntity,
    (portfolio) => portfolio.operations,
  )
  userAsset: UserAssetEntity;

  @Column({ type: 'enum', enum: UserAssetOperationType })
  type: UserAssetOperationType;

  @QuantityColumn()
  quantity: NumberString;

  @AmountColumn()
  amount: NumberString;

  @DateColumn()
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
