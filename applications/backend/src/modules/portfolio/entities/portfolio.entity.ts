// portfolio.entity.ts

import { PortfolioType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PortfolioAssetEntity } from '@/modules';
import { CurrencyEntity } from '@/modules/currency';
import { UserEntity } from '@/modules/user';

import { PortfolioSnapshotEntity } from './portfolio-snapshot.entity';

@Entity('portfolios')
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.portfolios,
    {
      onDelete: 'CASCADE', // Если удалить пользователя, удалить и его портфели
      eager: false,
    },
  )
  user: UserEntity;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Тип портфеля (важно для фильтрации и логики)
  @Column({ type: 'enum', enum: PortfolioType, default: PortfolioType.MAIN })
  type: PortfolioType;

  // --- Связь с Базовой валютой ---
  // Определяет, в какой валюте отображается итоговая стоимость
  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'baseCurrencyCode' })
  baseCurrency: CurrencyEntity;

  @Column()
  baseCurrencyCode: string; // FK: USD, RUB, EUR и т.д.

  // --- Денормализация и Кэширование ---
  // Эти поля обновляются фоновым процессом (Cron Job)
  // для высокой скорости загрузки главной страницы

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  cachedTotalValue: number; // Общая стоимость портфеля в baseCurrencyCode

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cachedDailyChangePercent: number; // Изменение стоимости за 24 часа в %

  @Column({ type: 'timestamp', nullable: true })
  lastValuationAt: string; // Время последнего обновления кэша

  // --- Связи с Активами ---
  @OneToMany(
    () => PortfolioAssetEntity,
    (asset) => asset.portfolio,
  )
  assets: PortfolioAssetEntity[];

  // --- Связи с Историей (Опционально) ---
  @OneToMany(
    () => PortfolioSnapshotEntity,
    (snapshot) => snapshot.portfolio,
  )
  snapshots: PortfolioSnapshotEntity[];

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
