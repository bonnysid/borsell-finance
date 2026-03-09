import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TableResponse } from '@packages/types';
import { Response } from 'express';

import { AuthGuard, CurrentUser, convertBigToNumberString } from '@/common';
import { UserJWT } from '@/express';
import { CurrencyConverterService } from '@/modules/currency/services';
import { UserService } from '@/modules/user/user.service';

import {
  AssetCandlesQueryDto,
  AssetDto,
  AssetHistoryQueryDto,
  AssetPriceDto,
  AssetPriceHistoryDto,
} from './dto';
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

  @UseGuards(AuthGuard)
  @Get('/:symbol')
  async getAssetInfo(
    @Param('symbol') symbol: string,
    @Res() res: Response,
    @CurrentUser() user?: UserJWT,
  ) {
    const asset = await this.appService.findOne(symbol);

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const userFromDB = user ? await this.userService.findOne(user?.username) : null;

    if (userFromDB) {
      const convertedPrice = await this.currencyConverterService.convertAmount({
        amount: asset.cachedMarketPrice,
        toCurrency: userFromDB.currencyCode,
        fromCurrency: asset.currencyCode,
      });

      return res.status(200).json(
        new AssetDto({
          ...asset,
          cachedMarketPrice: convertedPrice.amount.toString(),
          currencyCode: convertedPrice.toCurrency,
        }),
      );
    }

    return res.status(200).json(new AssetDto(asset));
  }

  @UseGuards(AuthGuard)
  @Get('/:symbol/price')
  async getAssetPriceWithChange(
    @Param('symbol') symbol: string,
    @Res() res: Response,
    @CurrentUser() user?: UserJWT,
  ) {
    const result = await this.appService.getAssetPriceWithChange(symbol);

    if (!result) {
      throw new NotFoundException('Asset not found');
    }

    const userFromDB = user ? await this.userService.findOne(user?.username) : null;

    if (userFromDB) {
      const convertedCurrentPrice = await this.currencyConverterService.convertAmount({
        amount: result.currentPrice,
        toCurrency: userFromDB.currencyCode,
        fromCurrency: result.currencyCode,
      });

      const convertedChange = await this.currencyConverterService.convertAmount({
        amount: result.change,
        toCurrency: userFromDB.currencyCode,
        fromCurrency: result.currencyCode,
      });

      const convertedPreviousPrice = await this.currencyConverterService.convertAmount({
        amount: result.previousPrice,
        toCurrency: userFromDB.currencyCode,
        fromCurrency: result.currencyCode,
      });

      return res.status(200).json(
        new AssetPriceDto({
          symbol: result.symbol,
          previousPrice: convertBigToNumberString(convertedPreviousPrice.amount),
          changePercent: result.changePercent,
          currentPrice: convertBigToNumberString(convertedCurrentPrice.amount),
          change: convertBigToNumberString(convertedChange.amount),
          currencyCode: convertedCurrentPrice.toCurrency,
          lastUpdateAt: result.lastUpdateAt.toISOString(),
        }),
      );
    }

    return res.status(200).json(
      new AssetPriceDto({
        ...result,
        lastUpdateAt: result.lastUpdateAt.toISOString(),
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:symbol/history')
  async getAssetHistory(
    @Param('symbol') symbol: string,
    @Query() query: AssetHistoryQueryDto,
    @Res() res?: Response,
    @CurrentUser() user?: UserJWT,
  ) {
    const history = await this.appService.getAssetPriceHistory(symbol, query);

    const userFromDB = user ? await this.userService.findOne(user?.username) : null;

    const result: AssetPriceHistoryDto[] = [];

    for (const h of history) {
      if (userFromDB) {
        const converted = await this.currencyConverterService.convertAmount({
          amount: h.closePrice, // Assuming we want closePrice converted for history simple view
          toCurrency: userFromDB.currencyCode,
          fromCurrency: h.currencyCode,
        });

        // We need to convert all prices if it's a history/candle view
        const convert = async (amount: string) => {
          const res = await this.currencyConverterService.convertAmount({
            amount,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: h.currencyCode,
          });
          return res.amount.toString();
        };

        result.push(
          new AssetPriceHistoryDto({
            ...h,
            openPrice: await convert(h.openPrice),
            highPrice: await convert(h.highPrice),
            lowPrice: await convert(h.lowPrice),
            closePrice: await convert(h.closePrice),
            currencyCode: userFromDB.currencyCode,
          }),
        );
      } else {
        result.push(new AssetPriceHistoryDto(h));
      }
    }

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Get('/:symbol/candles')
  async getAssetCandles(
    @Param('symbol') symbol: string,
    @Query() query: AssetCandlesQueryDto,
    @Res() res?: Response,
    @CurrentUser() user?: UserJWT,
  ) {
    const history = await this.appService.getAssetPriceCandles(symbol, query);

    const userFromDB = user ? await this.userService.findOne(user?.username) : null;

    const result: AssetPriceHistoryDto[] = [];

    for (const h of history) {
      if (userFromDB) {
        const convert = async (amount: string) => {
          const res = await this.currencyConverterService.convertAmount({
            amount,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: h.currencyCode,
          });
          return res.amount.toString();
        };

        result.push(
          new AssetPriceHistoryDto({
            ...h,
            openPrice: await convert(h.openPrice),
            highPrice: await convert(h.highPrice),
            lowPrice: await convert(h.lowPrice),
            closePrice: await convert(h.closePrice),
            currencyCode: userFromDB.currencyCode,
          }),
        );
      } else {
        result.push(new AssetPriceHistoryDto(h));
      }
    }

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
