import { NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AssetEntity } from '@/modules';

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
  portfolio: PortfolioEntity;

  // --- Связь с Каталогом Активов (Главный ключ к решению) ---
  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  // --- Поля владения ---

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  buyPrice: NumberString;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
