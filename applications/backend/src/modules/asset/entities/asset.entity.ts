// asset.entity.ts

import { AssetMetadata, AssetType } from '@packages/types';
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
import { PortfolioEntity } from '@/modules/portfolio';

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Связи ---

  // Связь "Много-к-одному": актив принадлежит одному портфелю
  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.assets,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'portfolioId' })
  portfolio: PortfolioEntity;

  @Column()
  portfolioId: string;

  // Связь "Много-к-одному": валюта, в которой куплен актив
  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string; // FK: USD, RUB, BTC

  // --- Основные данные ---

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column()
  name: string; // Отображаемое имя (например, "Tesla Inc." или "Karambit | Lore")

  // Количество (важно использовать Decimal для точности!)
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: number;

  // Средняя цена покупки за единицу (в валюте currencyCode). Ключ для расчета PnL.
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  averageBuyPrice: number;

  // --- Специфические данные (JSONB) ---

  // Поле для хранения уникальных свойств (тикеры, float, ISIN).
  // Используем JSONB для гибкости и скорости поиска в Postgres.
  @Column({ type: 'jsonb', default: {} })
  metadata: AssetMetadata;

  // --- Кэширование (для производительности) ---

  // Текущая рыночная цена (обновляется фоновым джобом, не берется из внешнего API при каждом запросе)
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  cachedMarketPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdateAt: string; // Когда последний раз обновлялась цена

  // --- Временные метки ---

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
