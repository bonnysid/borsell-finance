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

import { UserAssetEntity } from '@/modules/asset/entities/user-asset.entity';
import { RefreshTokenEntity } from '@/modules/auth';
import { CurrencyEntity } from '@/modules/currency';
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
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

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

  @ManyToOne(() => CurrencyEntity)
  @JoinColumn({ name: 'currencyCode' })
  currency: CurrencyEntity;

  @Column()
  currencyCode: string;
}
