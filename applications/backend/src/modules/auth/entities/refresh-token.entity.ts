import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '@/modules/user';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserEntity,
    (user) => user.refreshTokens,
  )
  user: UserEntity;

  @Column()
  tokenHash: string;

  @Column()
  expiresAt: Date;
}
