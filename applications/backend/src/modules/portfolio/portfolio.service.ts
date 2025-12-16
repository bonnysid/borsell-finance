import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from '@packages/types';
import Big from 'big.js';
import { In, Repository } from 'typeorm';

import { AssetEntity, PortfolioAssetEntity } from '@/modules/asset';
import { CurrencyConverterService } from '@/modules/currency';
import { SettingsService } from '@/modules/settings';

import { CreatePortfolioAssetDto, CreatePortfolioDto } from './dto';
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
    private readonly settingsService: SettingsService,
  ) {}

  async findByUserId(userId: string) {
    return this.portfolioRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async createPortfolio(userId: ID, dto: CreatePortfolioDto) {
    const assetsDict = dto.userAssetsIds.reduce((acc: Record<ID, CreatePortfolioAssetDto>, it) => {
      acc[it.assetId] = it;
      return acc;
    }, {});

    const assetIds = Object.keys(assetsDict);

    const assetsEntities = await this.assetRepository.find({
      where: {
        id: In(assetIds),
      },
    });

    const baseCurrencyCode = await this.settingsService.getBaseCurrencyCode();

    const portfolio = this.portfolioRepository.create({
      user: { id: userId },
      name: dto.name,
      description: dto.description,
      type: dto.type,
      lastValuationAt: new Date().toISOString(),
      currency: {
        code: baseCurrencyCode,
      },
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
        fromCurrency: it.currencyCode,
        toCurrency: portfolio.currencyCode ?? baseCurrencyCode,
      })),
    );

    const convertedBuyAssetsPrices = await this.currencyConverterService.convertMany(
      assetsEntities.map((it) => ({
        amount: assetsDict[it.id].buyPrice,
        fromCurrency: it.currencyCode,
        toCurrency: portfolio.currencyCode ?? baseCurrencyCode,
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
