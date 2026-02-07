import { NumberString } from '@packages/types';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PriceColumn } from '@/common/columns';

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

  @CreateDateColumn({ unique: true })
  createdAt: Date;
}
