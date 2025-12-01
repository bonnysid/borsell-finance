import { UserDtoShape } from '@packages/types';

import { User } from '@/modules/user/entities';

export class UserDto implements UserDtoShape {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.updatedAt = user.createdAt;
  }
}
