import { AssetCandlesQueryDtoShape } from '@packages/types';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class AssetCandlesQueryDto implements AssetCandlesQueryDtoShape {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  candles?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
}
