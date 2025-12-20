import { DateString, ID } from '../shared';
import { CurrencyCode } from '../currency';

export type UserDtoShape = {
  id: ID;
  username: string;
  createdAt: DateString;
  updatedAt: DateString;
  currencyCode: CurrencyCode
};
