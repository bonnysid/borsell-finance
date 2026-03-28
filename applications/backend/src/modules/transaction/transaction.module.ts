import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '@/database';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { UserModule } from '@/modules/user/user.module';

import { TransactionEntity } from './entities';
import { TransactionService } from './services';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([TransactionEntity]),
    UserModule,
    PortfolioModule,
    CurrencyModule,
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
