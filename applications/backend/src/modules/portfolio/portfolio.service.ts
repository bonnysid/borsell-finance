import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from '@packages/types';
import Big from 'big.js';
import { In, Repository } from 'typeorm';

import {
  AssetEntity,
  CreatePortfolioAssetDto,
  CreatePortfolioDto,
  PortfolioAssetEntity,
} from '@/modules';
import { CurrencyConverterService } from '@/modules/currency';

import { PortfolioEntity } from './entities';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(PortfolioAssetEntity)
    private readonly portfolioAssetRepository: Repository<PortfolioAssetEntity>,
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    private readonly currencyConverterService: CurrencyConverterService,
  ) {}

  async findByUserId(userId: string) {
    return this.portfolioRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async createPortfolio(userId: ID, dto: CreatePortfolioDto) {
    const assetsDict = dto.assets.reduce((acc: Record<ID, CreatePortfolioAssetDto>, it) => {
      acc[it.assetId] = it;
      return acc;
    }, {});

    const assetIds = Object.keys(assetsDict);

    const assetsEntities = await this.assetRepository.find({
      where: {
        id: In(assetIds),
      },
    });

    const portfolio = this.portfolioRepository.create({
      user: { id: userId },
      name: dto.name,
      description: dto.description,
      type: dto.type,
      lastValuationAt: new Date().toISOString(),
    });

    const portfolioAssets = assetsEntities.map((asset) =>
      this.portfolioAssetRepository.create({
        asset,
        quantity: String(assetsDict[asset.id].quantity),
        buyPrice: String(assetsDict[asset.id].buyPrice),
        portfolio,
      }),
    );

    portfolio.assets = portfolioAssets;

    const convertedAssetsPrices = await this.currencyConverterService.convertMany(
      assetsEntities.map((it) => ({
        amount: it.cachedMarketPrice,
        fromCurrency: it.quoteCurrencyCode,
      })),
    );

    const convertedBuyAssetsPrices = await this.currencyConverterService.convertMany(
      assetsEntities.map((it) => ({
        amount: assetsDict[it.id].buyPrice,
        fromCurrency: it.quoteCurrencyCode,
      })),
    );

    const buyPricesTotal = convertedBuyAssetsPrices.reduce((acc, it, i) => {
      const asset = assetsEntities[i];

      return acc.add(it.amount.mul(new Big(assetsDict[asset.id].quantity)));
    }, new Big(0));

    const priceTotal = convertedAssetsPrices.reduce((acc, it, i) => {
      const asset = assetsEntities[i];

      return acc.add(it.amount.mul(new Big(assetsDict[asset.id].quantity)));
    }, new Big(0));

    portfolio.cachedTotalValue = priceTotal.toString();

    return this.portfolioRepository.save(portfolio);
  }
}
