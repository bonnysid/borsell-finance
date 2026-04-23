import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MoexEtfService, MoexMapperService, MoexStockService } from './services';

@Module({
  imports: [HttpModule],
  providers: [MoexStockService, MoexEtfService, MoexMapperService],
  exports: [MoexStockService, MoexEtfService, MoexMapperService],
})
export class MoexModule {}
