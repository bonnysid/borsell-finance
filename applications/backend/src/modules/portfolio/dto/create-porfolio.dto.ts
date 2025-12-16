import { CreatePortfolioDtoShape, ID, PortfolioType } from '@packages/types';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreatePortfolioDto implements CreatePortfolioDtoShape {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PortfolioType)
  @IsOptional()
  type?: PortfolioType = PortfolioType.MAIN;

  @IsArray()
  @IsNotEmpty()
  userAssetsIds: ID[];
}
