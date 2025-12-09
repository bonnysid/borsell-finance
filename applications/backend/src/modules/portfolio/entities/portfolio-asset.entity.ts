import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AssetEntity, CurrencyEntity } from '@/modules';

import { PortfolioEntity } from './portfolio.entity';

@Entity('portfolio_asset')
export class PortfolioAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Уникальный ID этой конкретной позиции

  // --- Связи с Портфелем ---
  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.assets,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'portfolioId' })
  portfolio: PortfolioEntity;

  @Column()
  portfolioId: string;

  // --- Связь с Каталогом Активов (Главный ключ к решению) ---
  @ManyToOne(() => AssetEntity)
  @JoinColumn({ name: 'assetId' })
  asset: AssetEntity;

  @Column({ nullable: true })
  assetId: string;

  // --- Поля владения ---

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  buyPrice: number;

  // --- Связь с Валютой Покупки ---
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
