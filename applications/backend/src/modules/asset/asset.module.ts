import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetController } from './asset.controller';
import { AssetEntity, AssetPriceHistoryEntity } from './entities';
import { AssetSeederService, AssetService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, AssetPriceHistoryEntity])],
  providers: [AssetService, AssetSeederService],
  controllers: [AssetController],
})
export class AssetModule {}
