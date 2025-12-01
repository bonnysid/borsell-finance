import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

import { AuthGuard } from '@/common';
import { CONFIG } from '@/config';

import { AuthService } from './auth.service';
import { SingInDto, SingUpDto } from './dto';
import { RefreshTokenService } from './refresh-token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SingInDto, @Res() res: Response) {
    const tokens = await this.authService.signIn(signInDto);

    this.addRefreshTokenCookie(res, tokens.refreshToken);
    this.addAccessTokenCookie(res, tokens.accessToken);

    res.status(200).json({ message: 'Logged in successfully' });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken as string;

      if (!refreshToken) {
        return res.status(200).json({ message: 'Logged out successfully' });
      }

      const payload = await this.jwtService.verifyAsync(refreshToken, {
        ignoreExpiration: true,
      });

      const tokenDB = await this.refreshTokenService.findValidToken(payload.userId, refreshToken);

      if (tokenDB) {
        await this.refreshTokenService.delete(tokenDB.id);
      }

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch {
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out successfully' });
    }
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SingUpDto, @Res() res: Response) {
    const tokens = await this.authService.signUp(signUpDto);

    this.addRefreshTokenCookie(res, tokens.refreshToken);
    this.addAccessTokenCookie(res, tokens.accessToken);

    res.status(200).json({ message: 'Signed up successfully' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) throw new UnauthorizedException();

    const { userId } = await this.jwtService.verifyAsync(refreshToken, {
      ignoreExpiration: true,
      secret: CONFIG.refreshTokenSecret,
    });

    const tokens = await this.authService.refresh(userId, refreshToken);

    this.addRefreshTokenCookie(res, tokens.refreshToken);
    this.addAccessTokenCookie(res, tokens.accessToken);

    return res.status(200).json({ message: 'Refreshed successfully' });
  }

  private addRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: CONFIG.refreshTokenExpiresIn, // 30 дней
    });
  }

  private addAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: CONFIG.accessTokenExpiresIn, // 15 минут
    });
  }
}
