// create-portfolio.dto.ts

import { PortfolioType } from '@packages/types';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Ожидаем код валюты (USD, RUB, BTC). Он должен существовать в БД.
  @IsString()
  @IsNotEmpty()
  @Length(3, 8) // Например, 'BTC' или 'USD'
  baseCurrencyCode: string;

  @IsEnum(PortfolioType)
  @IsOptional()
  type?: PortfolioType = PortfolioType.MAIN; // По умолчанию MAIN
}
