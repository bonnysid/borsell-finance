import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetEntity, AssetPriceHistoryEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, AssetPriceHistoryEntity])],
})
export class AssetModule {}
