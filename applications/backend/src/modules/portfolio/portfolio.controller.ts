import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { UserService } from '@/modules/user/user.service';

import { CreatePortfolioDto, PortfolioDto, PortfolioSummaryDto } from './dto';
import { PortfolioService } from './services';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  async getPortfolio(@CurrentUser() user: UserJWT, @Res() res: Response) {
    let dbPortfolio = await this.portfolioService.findByUserId(user.userId);

    if (!dbPortfolio) {
      return res.status(200).json(null);
    }

    dbPortfolio = await this.portfolioService.updatePortfolioMetrics(dbPortfolio.id);

    return res.status(200).json(new PortfolioDto(dbPortfolio));
  }

  @Get('/summary')
  async getPortfolioSummary(@CurrentUser() user: UserJWT, @Res() res: Response) {
    const dbUser = await this.userService.findOne(user.username);

    if (!dbUser) {
      return res.status(200).json(null);
    }

    const summary = await this.portfolioService.getPortfolioSummary(
      user.userId,
      dbUser.currencyCode as any,
    );

    if (!summary) {
      return res.status(200).json(null);
    }

    return res.status(200).json(new PortfolioSummaryDto(summary));
  }

  @Get('/allocation')
  async getPortfolioAllocation(@CurrentUser() user: UserJWT, @Res() res: Response) {
    const dbUser = await this.userService.findOne(user.username);

    if (!dbUser) {
      return res.status(200).json(null);
    }

    const allocation = await this.portfolioService.getPortfolioAllocation(
      user.userId,
      dbUser.currencyCode as any,
    );

    if (!allocation) {
      return res.status(200).json(null);
    }

    return res.status(200).json(allocation);
  }

  @Get('/history')
  async getPortfolioHistory(@CurrentUser() user: UserJWT, @Res() res: Response) {
    const dbUser = await this.userService.findOne(user.username);

    if (!dbUser) {
      return res.status(200).json(null);
    }

    const history = await this.portfolioService.getPortfolioHistory(
      user.userId,
      dbUser.currencyCode as any,
    );

    if (!history) {
      return res.status(200).json(null);
    }

    return res.status(200).json(history);
  }

  @Post('/create')
  async createPortfolio(@CurrentUser() user: UserJWT, @Body() dto: CreatePortfolioDto) {
    return await this.portfolioService.createPortfolio(user.userId, dto);
  }
}
