import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfolioEntity, PortfolioSnapshotEntity } from './entities';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, PortfolioSnapshotEntity])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
