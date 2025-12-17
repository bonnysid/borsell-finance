import { ID, NumberString, PortfolioType } from '@packages/types';
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

import { PortfolioAssetEntity } from '@/modules/asset';
import { CurrencyEntity } from '@/modules/currency';
import { UserEntity } from '@/modules/user';

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

  // Тип портфеля (важно для фильтрации и логики)
  @Column({ type: 'enum', enum: PortfolioType, default: PortfolioType.MAIN })
  type: PortfolioType;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  cachedTotalValue: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  buyPrice: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  cachedDailyChangePercent: NumberString; // Изменение стоимости за 24 часа в %

  @Column({ type: 'timestamp', nullable: true })
  lastValuationAt: string;

  @OneToMany(
    () => PortfolioAssetEntity,
    (asset) => asset.portfolio,
  )
  assets: PortfolioAssetEntity[];

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string;

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
