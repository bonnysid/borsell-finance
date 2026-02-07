import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfolioModule } from '@/modules/portfolio/portfolio.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenEntity } from './entities';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    UserModule,
    PortfolioModule,
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],
  providers: [AuthService, RefreshTokenService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
