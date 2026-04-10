import { CurrencyCode, ID } from '@packages/types';

export class PortfolioAllocationItemDto {
  id: string;
  name: string;
  symbol: string;
  value: number; // рыночная стоимость в целевой валюте
  percentage: number;
  color?: string;

  constructor(data: Partial<PortfolioAllocationItemDto>) {
    Object.assign(this, data);
  }
}

export class PortfolioAllocationDto {
  items: PortfolioAllocationItemDto[];
  totalValue: number;
  currencyCode: CurrencyCode;

  constructor(data: Partial<PortfolioAllocationDto>) {
    Object.assign(this, data);
  }
}
