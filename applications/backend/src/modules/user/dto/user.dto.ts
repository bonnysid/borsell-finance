import { UserDtoShape } from '@packages/types';

import { UserEntity } from '@/modules/user/entities';

export class UserDto implements UserDtoShape {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.createdAt.toISOString();
  }
}
