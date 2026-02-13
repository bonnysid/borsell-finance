import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { TableResponse } from '@packages/types';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { PortfolioAssetService, PortfolioService } from '@/modules/portfolio/services';

import { CreateTransactionDto, GetTransactionsDto, TransactionDto } from './dto';
import { TransactionService } from './services';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly portfolioAssetService: PortfolioAssetService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get('/')
  async getTransactions(
    @Query() query: GetTransactionsDto,
    @CurrentUser() user: UserJWT,
    @Res() res: Response,
  ) {
    const [operations, total] = await this.transactionService.getTransactions(user.userId, query);

    const result: TableResponse<TransactionDto> = {
      data: operations.map((op) => new TransactionDto(op)),
      totalItems: total,
      page: query.page || 1,
    };

    return res.status(200).json(result);
  }

  @Post('/')
  async createTransaction(
    @Body() body: CreateTransactionDto,
    @CurrentUser() user: UserJWT,
    @Res() res: Response,
  ) {
    const userAsset = await this.transactionService.createTransaction({
      assetId: body.assetId,
      userId: user.userId,
      price: String(body.price),
      currencyCode: body.currencyCode,
      executedAt: new Date(),
      quantity: String(body.quantity),
      type: body.type,
    });
    const portfolio = await this.portfolioService.findByUserId(user.userId);

    if (portfolio) {
      await this.portfolioAssetService.createPortfolioAssetAndSave(portfolio.id, userAsset.id);
    }

    return res.status(200).json(userAsset);
  }
}
