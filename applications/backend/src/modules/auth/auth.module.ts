import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { RefreshToken } from '@/modules/auth/entities';
import { RefreshTokenService } from '@/modules/auth/refresh-token.service';
import { User, UserModule, UserService } from '@/modules/user';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([RefreshToken, User]),
  ],
  providers: [AuthService, RefreshTokenService, UserService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
