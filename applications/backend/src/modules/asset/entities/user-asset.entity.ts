import { NumberString } from '@packages/types';
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

import { CurrencyEntity } from '@/modules/currency';
import { UserEntity } from '@/modules/user';

import { AssetEntity } from './asset.entity';
import { PortfolioAssetEntity } from './portfolio-asset.entity';

@Entity('user_assets')
export class UserAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  @ManyToOne(
    () => UserEntity,
    (user) => user.assets,
    { onDelete: 'CASCADE' },
  )
  user: UserEntity;

  @OneToMany(
    () => PortfolioAssetEntity,
    (asset) => asset.userAsset,
  )
  portfolioAssets: PortfolioAssetEntity[];

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  quantity: NumberString;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  buyPrice: NumberString;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
