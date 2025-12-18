import { Controller, Get, Res } from '@nestjs/common';
import { TableResponse } from '@packages/types';
import { Response } from 'express';

import { AssetDto } from './dto';
import { AssetService } from './services';

@Controller('assets')
export class AssetController {
  constructor(private readonly appService: AssetService) {}

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
}
