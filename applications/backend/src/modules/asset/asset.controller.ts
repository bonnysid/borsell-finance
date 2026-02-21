import { Controller, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { TableResponse } from '@packages/types';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { CurrencyConverterService } from '@/modules/currency/services';
import { UserService } from '@/modules/user/user.service';

import { AssetCandlesQueryDto, AssetDto, AssetHistoryQueryDto, AssetPriceHistoryDto } from './dto';
import { AssetService, AssetUpdaterService } from './services';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly appService: AssetService,
    private readonly assetUpdaterService: AssetUpdaterService,
    private readonly currencyConverterService: CurrencyConverterService,
    private readonly userService: UserService,
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

  @Get('/:symbol/history')
  async getAssetHistory(
    @Param('symbol') symbol: string,
    @Query() query: AssetHistoryQueryDto,
    @Res() res?: Response,
  ) {
    const history = await this.appService.getAssetPriceHistory(symbol, query);

    const result = history.map((h) => new AssetPriceHistoryDto(h));

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  }

  @Get('/:symbol/candles')
  async getAssetCandles(
    @Param('symbol') symbol: string,
    @Query() query: AssetCandlesQueryDto,
    @Res() res?: Response,
  ) {
    const history = await this.appService.getAssetPriceCandles(symbol, query);

    const result = history.map((h) => new AssetPriceHistoryDto(h));

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Post('/update/:symbol')
  async updateAssetBySymbol(@Param('symbol') symbol: string, @Res() res: Response) {
    await this.assetUpdaterService.updateBySymbol(symbol);
    return res.status(200).send();
  }
}
