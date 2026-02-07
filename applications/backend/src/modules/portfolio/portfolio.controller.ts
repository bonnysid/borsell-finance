import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';

import { CreatePortfolioDto, PortfolioDto } from './dto';
import { PortfolioService } from './portfolio.service';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('/')
  async getPortfolio(@CurrentUser() user: UserJWT, @Res() res: Response) {
    const dbPortfolio = await this.portfolioService.findByUserId(user.userId);

    if (!dbPortfolio) {
      return null;
    }

    return res.status(200).json(new PortfolioDto(dbPortfolio));
  }

  @Post('/create')
  async createPortfolio(@CurrentUser() user: UserJWT, @Body() dto: CreatePortfolioDto) {
    return await this.portfolioService.createPortfolio(user.userId, dto);
  }
}
