import { DateString, NumberString } from '@packages/types';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';

import { DayDateColumn, PriceColumn } from '@/common/columns';

import { PortfolioEntity } from './portfolio.entity';

@Entity('portfolio_snapshots')
@Unique(['portfolio', 'createdAt'])
export class PortfolioSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PortfolioEntity,
    (portfolio) => portfolio.snapshots,
    { onDelete: 'CASCADE' },
  )
  portfolio: PortfolioEntity;

  @PriceColumn()
  marketPrice: NumberString;

  // Общая рыночная стоимость всех активов на эту дату
  @PriceColumn()
  costBasis: NumberString;

  // Общая сумма, которую пользователь вложил (депозиты)
  @PriceColumn()
  totalInvested: NumberString;

  // Общая сумма, которую пользователь вывел (выводы)
  @PriceColumn()
  totalWithdrawn: NumberString;

  // Прибыль/Убыток за период от начала инвестирования
  @PriceColumn()
  realizedPnl: NumberString;

  @DayDateColumn()
  createdAt: DateString;

  @CreateDateColumn()
  systemCreatedAt: Date;
}
