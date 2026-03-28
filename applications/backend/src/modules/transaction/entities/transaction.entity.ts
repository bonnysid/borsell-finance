import { CurrencyCode, ID, NumberString, TransactionType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AmountColumn, DateColumn, PriceColumn, QuantityColumn } from '@/common/columns';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';
import { UserAssetEntity } from '@/modules/user-asset/entities';

@Entity('transactions')
@Index(['userAssetId', 'executedAt'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userAssetId: ID;

  @ManyToOne(
    () => UserAssetEntity,
    (portfolio) => portfolio.transactions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'userAssetId' })
  userAsset: UserAssetEntity;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @QuantityColumn()
  quantity: NumberString;

  @AmountColumn()
  amount: NumberString;

  @PriceColumn()
  price: NumberString;

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @DateColumn()
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
