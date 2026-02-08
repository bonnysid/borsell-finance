import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from '@/database';
import { I18nAppModule } from '@/i18n';
import { AssetModule } from '@/modules/asset/asset.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { MoexModule } from '@/modules/moex/moex.module';
import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { UserModule } from '@/modules/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    I18nAppModule,

    SettingsModule,
    UserModule,
    AuthModule,
    CurrencyModule,
    MoexModule,
    AssetModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
