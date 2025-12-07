import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
})
export class CurrencyModule {}
