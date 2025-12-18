import { AssetPriceTimeframe, CurrencyCode, NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn, NumericColumn, PriceColumn } from '@/common/columns';
import { CurrencyCodeColumn, CurrencyEntity, CurrencyRelationColumn } from '@/modules/currency';

import { AssetEntity } from './asset.entity';

@Entity('asset_price_history')
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

  @DateColumn()
  date: Date;

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
