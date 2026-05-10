import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn } from '@/common/columns';

@Entity('news_symbol_syncs')
@Index(['provider', 'symbol'], { unique: true })
export class NewsSymbolSyncEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  provider: string;

  @Column({ type: 'varchar', length: 32 })
  symbol: string;

  @DateColumn({ name: 'last_fetched_at' })
  lastFetchedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
