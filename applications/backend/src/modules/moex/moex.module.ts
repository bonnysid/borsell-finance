import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  MoexBoardEntity,
  MoexEngineEntity,
  MoexMarketEntity,
  MoexSecurityEntity,
  MoexTradeEntity,
} from './entities';
import { MoexAssetService, MoexSchedulerService, MoexSeederService, MoexService } from './services';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      MoexEngineEntity,
      MoexMarketEntity,
      MoexBoardEntity,
      MoexSecurityEntity,
      MoexTradeEntity,
    ]),
  ],
  providers: [MoexService, MoexAssetService, MoexSeederService, MoexSchedulerService],
  exports: [MoexService, MoexAssetService, MoexSeederService, MoexSchedulerService],
})
export class MoexModule {}
