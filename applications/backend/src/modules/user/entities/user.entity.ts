import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserAssetEntity } from '@/modules/asset/entities/user-asset.entity';
import { RefreshTokenEntity } from '@/modules/auth';
import { CurrencyCodeColumn, CurrencyEntity, CurrencyRelationColumn } from '@/modules/currency';
import { PortfolioEntity } from '@/modules/portfolio';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  username: string;

  @Column({
    type: 'text',
  })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => RefreshTokenEntity,
    (refreshToken) => refreshToken.user,
  )
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(
    () => PortfolioEntity,
    (portfolio) => portfolio.user,
  )
  portfolios: PortfolioEntity[];

  @OneToMany(
    () => UserAssetEntity,
    (asset) => asset.user,
  )
  assets: UserAssetEntity[];

  @CurrencyRelationColumn()
  currency: CurrencyEntity;

  @CurrencyCodeColumn()
  currencyCode: string;
}
