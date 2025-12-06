import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity])],
})
export class AssetModule {}
