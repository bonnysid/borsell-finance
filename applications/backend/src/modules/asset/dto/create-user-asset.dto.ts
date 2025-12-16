import { CreateUserAssetDtoShape } from '@packages/types';
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateUserAssetDto implements CreateUserAssetDtoShape {
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

  @IsString()
  currencyCode?: string;
}
