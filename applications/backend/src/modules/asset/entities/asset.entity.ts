import { AssetMetadata, AssetType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  cachedMarketPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdateAt: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
