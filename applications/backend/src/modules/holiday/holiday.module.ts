import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HolidayEntity } from './entities';
import { HolidayService } from './services/holiday.service';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity]), HttpModule],
  providers: [HolidayService],
  exports: [HolidayService],
})
export class HolidayModule {}
