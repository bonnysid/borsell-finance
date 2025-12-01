import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/modules/user';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => User,
    (user) => user.refreshTokens,
  )
  user: User;

  @Column()
  tokenHash: string;

  @Column()
  expiresAt: Date;
}
