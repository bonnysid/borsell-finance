import { AssetMetadata, AssetType, NumberString } from '@packages/types';
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

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: AssetMetadata;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  cachedMarketPrice: NumberString;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdateAt: string;

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
