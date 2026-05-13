import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type NewsSentiment = 'positive' | 'neutral' | 'negative';

@Entity('asset_news_analysis')
@Index(['symbolKey'], { unique: true })
export class AssetNewsAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Sorted comma-separated symbols, e.g. "AFKS,GAZP,SBER"
  @Column({ name: 'symbol_key', type: 'varchar', length: 512 })
  symbolKey: string;

  @Column({ type: 'text' })
  analysis: string;

  @Column({ type: 'varchar', length: 16 })
  sentiment: NewsSentiment;

  @Column({ name: 'news_count', type: 'int' })
  newsCount: number;

  @Column({ name: 'analyzed_at', type: 'timestamptz' })
  analyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
