import { AssetPriceHistoryQueryDtoShape, AssetPriceTimeframe } from '@packages/types';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

export class AssetHistoryQueryDto implements AssetPriceHistoryQueryDtoShape {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsOptional()
  @IsEnum(AssetPriceTimeframe)
  timeframe?: AssetPriceTimeframe;
}
