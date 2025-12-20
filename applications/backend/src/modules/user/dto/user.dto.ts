import { CurrencyCode, UserDtoShape } from '@packages/types';

import { UserEntity } from '@/modules/user/entities';

export class UserDto implements UserDtoShape {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  currencyCode: CurrencyCode;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.createdAt.toISOString();
    this.currencyCode = user.currencyCode;
  }
}
