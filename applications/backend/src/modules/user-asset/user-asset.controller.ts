import { Controller, Delete, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ID, TableResponse } from '@packages/types';
import { Response } from 'express';

import { AuthGuard, CurrentUser } from '@/common';
import { UserJWT } from '@/express';
import { CurrencyConverterService } from '@/modules/currency/services';
import { UserService } from '@/modules/user/user.service';
import { UserAssetService } from '@/modules/user-asset/services';

import { UserAssetDto } from './dto';

@UseGuards(AuthGuard)
@Controller('user-assets')
export class UserAssetController {
  constructor(
    private readonly userAssetService: UserAssetService,
    private readonly currencyConverterService: CurrencyConverterService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  async getMeAssets(@Res() res: Response, @CurrentUser() user: UserJWT) {
    const userAssets = await this.userAssetService.getUserAssets(user.userId);
    const userFromDB = await this.userService.findOne(user.username);
    const mappedAssets: UserAssetDto[] = [];

    for (const userAsset of userAssets) {
      if (userFromDB) {
        const assetCurrency = userAsset.asset.currencyCode;
        const userAssetCurrency = userAsset.currencyCode;

        const [
          assetMarketPrice,
          avgBuyPrice,
          costBasis,
          totalInvested,
          totalWithdrawn,
          realizedPnl,
        ] = await this.currencyConverterService.convertMany([
          {
            amount: userAsset.asset.cachedMarketPrice,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: assetCurrency,
          },
          {
            amount: userAsset.avgBuyPrice,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: userAssetCurrency,
          },
          {
            amount: userAsset.costBasis,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: userAssetCurrency,
          },
          {
            amount: userAsset.totalInvested,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: userAssetCurrency,
          },
          {
            amount: userAsset.totalWithdrawn,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: userAssetCurrency,
          },
          {
            amount: userAsset.realizedPnl,
            toCurrency: userFromDB.currencyCode,
            fromCurrency: userAssetCurrency,
          },
        ]);

        mappedAssets.push(
          new UserAssetDto({
            ...userAsset,
            asset: {
              ...userAsset.asset,
              cachedMarketPrice: assetMarketPrice.amount.toString(),
              currencyCode: userFromDB.currencyCode,
            },
            currencyCode: userFromDB.currencyCode,
            avgBuyPrice: avgBuyPrice.amount.toString(),
            costBasis: costBasis.amount.toString(),
            totalInvested: totalInvested.amount.toString(),
            totalWithdrawn: totalWithdrawn.amount.toString(),
            realizedPnl: realizedPnl.amount.toString(),
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

  @Delete('/:id')
  async deleteAsset(@Res() res: Response, @CurrentUser() user: UserJWT, @Param('id') id: ID) {
    await this.userAssetService.deleteUserAsset(user.userId, id);
    return res.status(200);
  }
}
