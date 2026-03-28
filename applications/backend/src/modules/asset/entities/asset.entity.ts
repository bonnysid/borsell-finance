import { AssetMetadata, AssetType, CurrencyCode, NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn, PriceColumn } from '@/common/columns';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column()
  name: string;

  @Column({ unique: true })
  symbol: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: AssetMetadata;

  @PriceColumn()
  cachedMarketPrice: NumberString;

  @PriceColumn()
  volume: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  changePercent1h: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  changePercent24h: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  changePercent7d: NumberString;

  @DateColumn()
  lastPriceUpdateAt: Date;

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
