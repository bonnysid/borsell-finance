import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortfolioType } from '@packages/types';
import * as bcrypt from 'bcrypt';

import { CONFIG } from '@/config';
import { UserJWT } from '@/express';
import { SingInDto, SingUpDto } from '@/modules/auth/dto';
import { PortfolioService } from '@/modules/portfolio/portfolio.service';
import { UserService } from '@/modules/user/user.service';

import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private portfolioService: PortfolioService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async signIn(dto: SingInDto) {
    const user = await this.usersService.findOne(dto.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isValid = bcrypt.compareSync(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const payload = { userId: user.id, username: user.username };

    return this.createTokens(user.id, payload);
  }

  async signUp(dto: SingUpDto) {
    const user = await this.usersService.create(dto);

    await this.portfolioService.createPortfolio(user.id, {
      userAssetsIds: [],
      name: user.username,
      type: PortfolioType.MAIN,
    });

    const payload = { userId: user.id, username: user.username };

    return this.createTokens(user.id, payload);
  }

  async refresh(userId: string, token: string) {
    const tokenEntity = await this.refreshTokenService.findValidToken(userId, token);

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      await this.refreshTokenService.deleteAllForUser(userId);
      throw new UnauthorizedException('Refresh token invalid');
    }

    await this.refreshTokenService.delete(tokenEntity.id);

    const payload = await this.jwtService.verifyAsync<UserJWT>(token, {
      secret: CONFIG.refreshTokenSecret,
    });

    return this.createTokens(userId, {
      username: payload.username,
      userId: payload.userId,
    });
  }

  private async createTokens(userId: string, payload: UserJWT) {
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: CONFIG.refreshTokenSecret,
      expiresIn: CONFIG.refreshTokenExpiresIn,
    });

    const expiresAt = new Date(Date.now() + CONFIG.refreshTokenExpiresIn);
    await this.refreshTokenService.create(userId, refreshToken, expiresAt);

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: CONFIG.accessTokenSecret,
        expiresIn: CONFIG.accessTokenExpiresIn,
      }),
      refreshToken,
    };
  }
}
