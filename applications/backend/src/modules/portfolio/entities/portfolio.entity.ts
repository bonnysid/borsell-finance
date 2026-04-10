import { CurrencyCode, ID, NumberString, PortfolioType } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn, PriceColumn } from '@/common';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';
import { PortfolioAssetEntity } from '@/modules/portfolio/entities/portfolio-asset.entity';
import { UserEntity } from '@/modules/user/entities';

import { PortfolioSnapshotEntity } from './portfolio-snapshot.entity';

@Entity('portfolios')
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: ID;

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

  @Column({ type: 'enum', enum: PortfolioType, default: PortfolioType.MAIN })
  type: PortfolioType;

  @PriceColumn()
  marketPrice: NumberString;

  @PriceColumn()
  costBasis: NumberString;

  @PriceColumn()
  totalInvested: NumberString;

  // Общая сумма, которую пользователь вывел (выводы)
  @PriceColumn()
  totalWithdrawn: NumberString;

  // Прибыль/Убыток за период от начала инвестирования
  @PriceColumn()
  realizedPnl: NumberString;

  @DateColumn({ nullable: true })
  lastValuationAt: Date;

  @DateColumn({ nullable: true })
  historyLastUpdatedAt: Date;

  @OneToMany(
    () => PortfolioAssetEntity,
    (asset) => asset.portfolio,
  )
  assets: PortfolioAssetEntity[];

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: CurrencyCode;

  @OneToMany(
    () => PortfolioSnapshotEntity,
    (snapshot) => snapshot.portfolio,
  )
  snapshots: PortfolioSnapshotEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
