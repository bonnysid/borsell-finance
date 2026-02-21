import { AssetCandlesQueryDtoShape } from '@packages/types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class AssetCandlesQueryDto implements AssetCandlesQueryDtoShape {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  candles?: number;
}
