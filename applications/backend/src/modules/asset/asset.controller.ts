import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID, TableResponse } from '@packages/types';
import { Response } from 'express';
import { Repository } from 'typeorm';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { CurrencyConverterService } from '@/modules/currency/services';
import { PortfolioEntity } from '@/modules/portfolio/entities';
import { UserService } from '@/modules/user/user.service';

import { ApplyAssetOperationDto, AssetDto, UserAssetDto } from './dto';
import {
  AssetService,
  AssetUpdaterService,
  PortfolioAssetService,
  UserAssetService,
} from './services';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly appService: AssetService,
    private readonly assetUpdaterService: AssetUpdaterService,
    private readonly userAssetService: UserAssetService,
    private readonly portfolioAssetService: PortfolioAssetService,
    private readonly currencyConverterService: CurrencyConverterService,
    private readonly userService: UserService,
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAssets(@Res() res: Response, @CurrentUser() user?: UserJWT) {
    const assets = await this.appService.getAllAssets();
    const userFromDB = user ? await this.userService.findOne(user?.username) : null;
    const mappedAssets: AssetDto[] = [];

    for (const asset of assets) {
      if (userFromDB) {
        const convertedPrice = await this.currencyConverterService.convertAmount({
          amount: asset.cachedMarketPrice,
          toCurrency: userFromDB.currencyCode,
          fromCurrency: asset.currencyCode,
        });

        mappedAssets.push(
          new AssetDto({
            ...asset,
            cachedMarketPrice: convertedPrice.amount.toString(),
            currencyCode: convertedPrice.toCurrency,
          }),
        );
      } else {
        mappedAssets.push(new AssetDto(asset));
      }
    }

    const result: TableResponse<AssetDto> = {
      data: mappedAssets,
      totalItems: mappedAssets.length,
      page: 1,
    };

    res.status(200).json(result);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMeAssets(@Res() res: Response, @CurrentUser() user: UserJWT) {
    const userAssets = await this.userAssetService.getUserAssets(user.userId);
    const userFromDB = await this.userService.findOne(user.username);
    const mappedAssets: UserAssetDto[] = [];

    for (const userAsset of userAssets) {
      if (userFromDB) {
        const convertedPrice = await this.currencyConverterService.convertAmount({
          amount: userAsset.asset.cachedMarketPrice,
          toCurrency: userFromDB.currencyCode,
          fromCurrency: userAsset.asset.currencyCode,
        });

        mappedAssets.push(
          new UserAssetDto({
            ...userAsset,
            asset: {
              ...userAsset.asset,
              cachedMarketPrice: convertedPrice.amount.toString(),
              currencyCode: convertedPrice.toCurrency,
            },
          }),
        );
      } else {
        mappedAssets.push(new UserAssetDto(userAsset));
      }
    }

    const result: TableResponse<UserAssetDto> = {
      data: mappedAssets,
      totalItems: mappedAssets.length,
      page: 1,
    };

    return res.status(200).json(result);
  }

  @UseGuards(AuthGuard)
  @Post('/apply/operation')
  async applyOperation(
    @Body() body: ApplyAssetOperationDto,
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
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: user.userId } },
    });

    if (portfolio) {
      await this.portfolioAssetService.createPortfolioAssetAndSave(portfolio.id, userAsset.id);
    }

    return res.status(200).json(userAsset);
  }

  @UseGuards(AuthGuard)
  @Post('/update/:symbol')
  async updateAssetBySymbol(@Param('symbol') symbol: string, @Res() res: Response) {
    await this.assetUpdaterService.updateBySymbol(symbol);
    return res.status(200).send();
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteAsset(@Res() res: Response, @CurrentUser() user: UserJWT, @Param('id') id: ID) {
    await this.userAssetService.deleteUserAsset(user.userId, id);
    return res.status(200);
  }
}
