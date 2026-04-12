import { AssetPriceTimeframe, CurrencyCode, DateString, NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { DayDateColumn, NumericColumn, PriceColumn } from '@/common/columns';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';

import { AssetEntity } from './asset.entity';

@Entity('asset_price_history')
@Unique(['asset', 'date', 'timeframe'])
export class AssetPriceHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  @Column({
    type: 'enum',
    enum: AssetPriceTimeframe,
    default: AssetPriceTimeframe.DAY,
  })
  timeframe: AssetPriceTimeframe;

  @DayDateColumn()
  date: DateString;

  @PriceColumn()
  openPrice: NumberString;

  @PriceColumn()
  highPrice: NumberString;

  @PriceColumn()
  lowPrice: NumberString;

  @PriceColumn()
  closePrice: NumberString;

  @NumericColumn()
  volume: NumberString;

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
