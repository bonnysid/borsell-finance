import { AssetPriceTimeframe, NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CurrencyEntity } from '@/modules/currency';

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

  @Column({ type: 'timestamp' })
  date: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  openPrice: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  highPrice: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  lowPrice: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  closePrice: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  volume: NumberString;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
