import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfolioEntity, PortfolioSnapshotEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, PortfolioSnapshotEntity])],
})
export class PortfolioModule {}
