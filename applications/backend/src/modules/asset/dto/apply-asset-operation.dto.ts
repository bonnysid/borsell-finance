import {
  ApplyAssetOperationDtoShape,
  CurrencyCode,
  ID,
  UserAssetOperationType,
} from '@packages/types';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class ApplyAssetOperationDto implements ApplyAssetOperationDtoShape {
  @IsUUID()
  @IsNotEmpty()
  assetId: ID;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  currencyCode: CurrencyCode;

  @IsEnum(UserAssetOperationType)
  @IsNotEmpty()
  type: UserAssetOperationType;
}
