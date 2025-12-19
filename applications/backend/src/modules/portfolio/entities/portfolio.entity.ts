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

import { DateColumn, NumericColumn, PriceColumn } from '@/common/columns';
import { PortfolioAssetEntity } from '@/modules/asset/entities';
import { CurrencyCodeColumn, CurrencyRelationColumn } from '@/modules/currency/columns';
import { CurrencyEntity } from '@/modules/currency/entities';
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
  cachedTotalValue: NumberString;

  @PriceColumn()
  buyPrice: NumberString;

  @NumericColumn()
  cachedDailyChangePercent: NumberString; // Изменение стоимости за 24 часа в %

  @DateColumn({ nullable: true })
  lastValuationAt: Date;

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
