import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoexBoardEntity, MoexEngineEntity, MoexMarketEntity } from './entities';
import {
  MoexEtfService,
  MoexMapperService,
  MoexSchedulerService,
  MoexSeederService,
  MoexService,
  MoexStockService,
} from './services';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([MoexEngineEntity, MoexMarketEntity, MoexBoardEntity])],
  providers: [
    MoexStockService,
    MoexEtfService,
    MoexMapperService,
    MoexService,
    MoexSeederService,
    MoexSchedulerService,
  ],
  exports: [
    MoexStockService,
    MoexEtfService,
    MoexMapperService,
    MoexService,
    MoexSeederService,
    MoexSchedulerService,
  ],
})
export class MoexModule {}
