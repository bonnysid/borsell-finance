import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RefreshTokenEntity } from '@/modules/auth/entities/refresh-token.entity';
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
  password: string;

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
}
