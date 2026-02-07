import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MoexService } from './moex.service';

@Module({
  imports: [HttpModule],
  providers: [MoexService],
  exports: [MoexService],
})
export class MoexModule {}
