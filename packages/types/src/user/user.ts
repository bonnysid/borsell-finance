import { DateString, ID } from '../shared';

export type UserDtoShape = {
  id: ID;
  username: string;
  createdAt: DateString;
  updatedAt: DateString;
};
