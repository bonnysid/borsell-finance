import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule } from '@/database';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { UserModule } from '@/modules/user/user.module';

import { UserAssetEntity } from './entities';
import { UserAssetService } from './services';
import { UserAssetController } from './user-asset.controller';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([UserAssetEntity]),
    CurrencyModule,
    UserModule,
  ],
  providers: [UserAssetService],
  controllers: [UserAssetController],
  exports: [UserAssetService],
})
export class UserAssetModule {}
