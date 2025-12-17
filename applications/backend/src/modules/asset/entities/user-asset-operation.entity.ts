import { ID, NumberString, UserAssetOperationType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
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

  @DateColumn()
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
