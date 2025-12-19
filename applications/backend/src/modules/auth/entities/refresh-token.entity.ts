import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DateColumn } from '@/common/columns';
import { UserEntity } from '@/modules/user/entities';

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

  @DateColumn()
  expiresAt: Date;
}
