import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@/database/DatabaseModule';
import { I18nAppModule } from '@/i18n';
import { AssetModule } from '@/modules/asset';
import { AuthModule } from '@/modules/auth';
import { CurrencyModule } from '@/modules/currency';
import { PortfolioModule } from '@/modules/portfolio';
import { SettingsModule } from '@/modules/settings';
import { UserModule } from '@/modules/user';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    SettingsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    I18nAppModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    CurrencyModule,
    AssetModule,
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
