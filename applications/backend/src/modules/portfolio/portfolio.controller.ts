import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';

import { PortfolioDto } from './dto';
import { PortfolioService } from './portfolio.service';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('/')
  async getPortfolio(@CurrentUser() user: UserJWT) {
    const dbPortfolio = await this.portfolioService.findByUserId(user.userId);

    if (!dbPortfolio) {
      return null;
    }

    return new PortfolioDto(dbPortfolio);
  }
}
