import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { PortfolioInsightDtoShape } from '@packages/types';

@Entity('portfolio_insight_cache')
@Index(['userId', 'currencyCode'], { unique: true })
export class PortfolioInsightCacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 8 })
  currencyCode: string;

  @Column({ type: 'jsonb' })
  data: PortfolioInsightDtoShape;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
