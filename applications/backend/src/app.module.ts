import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { HttpLoggerMiddleware } from '@/common';
import { DatabaseModule } from '@/database';
import { I18nAppModule } from '@/i18n';
import { AssistantModule } from '@/modules/assistant/assistant.module';
import { AssetModule } from '@/modules/asset/asset.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CurrencyModule } from '@/modules/currency/currency.module';
import { HolidayModule } from '@/modules/holiday/holiday.module';
import { MoexModule } from '@/modules/moex/moex.module';
import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { TransactionModule } from '@/modules/transaction/transaction.module';
import { UserModule } from '@/modules/user/user.module';
import { UserAssetModule } from '@/modules/user-asset/user-asset.module';
import { AiModule } from '@/modules/ai/ai.module';

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
    HolidayModule,
    MoexModule,
    AssetModule,
    PortfolioModule,
    AssistantModule,
    TransactionModule,
    UserAssetModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
