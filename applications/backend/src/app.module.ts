import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@/database/DatabaseModule';
import { I18nAppModule } from '@/i18n';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetModule, AuthModule, CurrencyModule, PortfolioModule, UserModule } from './modules';

@Module({
  imports: [
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
