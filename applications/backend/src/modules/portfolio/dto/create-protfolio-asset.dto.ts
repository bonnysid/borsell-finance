import { CreatePortfolioAssetDtoShape } from '@packages/types';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreatePortfolioAssetDto implements CreatePortfolioAssetDtoShape {
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  buyPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
