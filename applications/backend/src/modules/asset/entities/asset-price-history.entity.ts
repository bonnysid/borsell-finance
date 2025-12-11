import { AssetPriceTimeframe } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AssetEntity } from './asset.entity';

@Entity()
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
  openPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  highPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  lowPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  closePrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  volume: number;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
