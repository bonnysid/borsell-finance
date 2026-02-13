import { CreateTransactionDtoShape, CurrencyCode, ID, TransactionType } from '@packages/types';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto implements CreateTransactionDtoShape {
  @IsUUID()
  @IsNotEmpty()
  assetId: ID;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  currencyCode: CurrencyCode;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;
}
