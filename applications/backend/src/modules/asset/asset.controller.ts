import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { TableResponse } from '@packages/types';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';

import { AssetDto, CreateUserAssetDto } from './dto';
import { AssetService, UserAssetService } from './services';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly appService: AssetService,
    private readonly userAssetService: UserAssetService,
  ) {}

  @Get()
  async getAssets(@Res() res: Response) {
    const assets = await this.appService.getAllAssets();

    const mappedAssets = assets.map((asset) => new AssetDto(asset));

    const result: TableResponse<AssetDto> = {
      data: mappedAssets,
      totalItems: mappedAssets.length,
      page: 1,
    };

    res.status(200).json(result);
  }

  @UseGuards(AuthGuard)
  @Post('/apply/operation')
  async applyOperation(
    @Body() body: CreateUserAssetDto,
    @CurrentUser() user: UserJWT,
    @Res() res: Response,
  ) {
    const userAsset = await this.userAssetService.applyOperation({
      assetId: body.assetId,
      userId: user.userId,
      amount: String(body.amount),
      currencyCode: body.currencyCode,
      executedAt: new Date(),
      quantity: String(body.quantity),
      type: body.type,
    });

    return res.status(200).json(userAsset);
  }
}
