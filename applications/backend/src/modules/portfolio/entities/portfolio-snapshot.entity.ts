import { NumberString } from '@packages/types';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DateColumn, PriceColumn } from '@/common/columns';

import { PortfolioEntity } from './portfolio.entity';

@Entity('portfolio_snapshots')
export class PortfolioSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.snapshots,
    { onDelete: 'CASCADE' },
  )
  portfolio: PortfolioEntity;

  @DateColumn({ unique: true }) // Уникальность по дате в рамках одного портфеля
  snapshotAt: Date;

  // Общая рыночная стоимость всех активов на эту дату
  @PriceColumn()
  totalValue: NumberString;

  // Общая сумма, которую пользователь вложил (депозиты)
  @PriceColumn()
  totalInvested: NumberString;

  // Общая сумма, которую пользователь вывел (выводы)
  @PriceColumn()
  totalWithdrawn: NumberString;

  // Прибыль/Убыток за период от начала инвестирования
  @PriceColumn()
  unrealizedGainLoss: NumberString;
}
