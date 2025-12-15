import { CreatePortfolioDtoShape, PortfolioType } from '@packages/types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import { CreatePortfolioAssetDto } from './create-protfolio-asset.dto';

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
  @ValidateNested({ each: true })
  @Type(() => CreatePortfolioAssetDto)
  assets: CreatePortfolioAssetDto[];
}
