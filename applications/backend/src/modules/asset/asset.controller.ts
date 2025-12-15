import { Controller, Get, Res } from '@nestjs/common';
import { ArrayResponse } from '@packages/types';
import { Response } from 'express';

import { AssetDto } from '@/modules';

import { AssetService } from './services';

@Controller('assets')
export class AssetController {
  constructor(private readonly appService: AssetService) {}

  @Get()
  async getAssets(@Res() res: Response) {
    const assets = await this.appService.getAllAssets();

    const mappedAssets = assets.map((asset) => new AssetDto(asset));

    const result: ArrayResponse<AssetDto> = {
      data: mappedAssets,
      totalItems: mappedAssets.length,
      page: 1,
    };

    res.status(200).json(result);
  }
}
