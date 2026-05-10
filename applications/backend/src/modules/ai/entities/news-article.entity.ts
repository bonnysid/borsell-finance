import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn } from '@/common/columns';

@Entity('news_articles')
@Index(['provider', 'symbol', 'externalId'], { unique: true })
@Index(['symbol', 'publishedAt'])
export class NewsArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  provider: string;

  @Column({ type: 'varchar', length: 32 })
  symbol: string;

  @Column({ name: 'external_id', type: 'varchar', length: 128 })
  externalId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ type: 'text' })
  url: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'varchar', length: 255 })
  source: string;

  @DateColumn({ name: 'published_at' })
  publishedAt: Date;

  @DateColumn({ name: 'fetched_at' })
  fetchedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
