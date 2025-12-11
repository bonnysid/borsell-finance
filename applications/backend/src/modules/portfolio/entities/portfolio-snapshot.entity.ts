import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PortfolioEntity } from './portfolio.entity';

@Entity('portfolio_snapshots')
export class PortfolioSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Связь с портфелем
  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.snapshots,
    { onDelete: 'CASCADE' },
  )
  portfolio: PortfolioEntity;

  // ⭐️ Ключевое поле: Дата снимка
  @Column({ type: 'timestamp', unique: true }) // Уникальность по дате в рамках одного портфеля
  snapshotAt: string;

  // --- Основные метрики (в baseCurrency портфеля) ---

  // Общая рыночная стоимость всех активов на эту дату
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  totalValue: number;

  // Общая сумма, которую пользователь вложил (депозиты)
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  totalInvested: number;

  // Общая сумма, которую пользователь вывел (выводы)
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  totalWithdrawn: number;

  // Прибыль/Убыток за период от начала инвестирования
  @Column({ type: 'decimal', precision: 18, scale: 4 })
  unrealizedGainLoss: number;
}
