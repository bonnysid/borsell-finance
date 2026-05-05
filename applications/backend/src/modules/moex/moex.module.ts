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
import { MoexSchedulerService, MoexSeederService, MoexService } from './services';

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
  providers: [MoexService, MoexSeederService, MoexSchedulerService],
  exports: [MoexService, MoexSeederService, MoexSchedulerService],
})
export class MoexModule {}
