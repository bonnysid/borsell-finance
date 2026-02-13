import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from '@packages/types';
import Big from 'big.js';
import { Repository } from 'typeorm';

import { CurrencyConverterService } from '@/modules/currency/services';
import { CreatePortfolioDto } from '@/modules/portfolio/dto';
import { PortfolioEntity, PortfolioSnapshotEntity } from '@/modules/portfolio/entities';
import { SettingsService } from '@/modules/settings/services';
import { UserAssetService } from '@/modules/user-asset/services';

import { PortfolioAssetService } from './protfolio-asset.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(PortfolioSnapshotEntity)
    private readonly portfolioSnapshotRepository: Repository<PortfolioSnapshotEntity>,
    private readonly userAssetService: UserAssetService,
    private readonly settingsService: SettingsService,
    private readonly portfolioAssetService: PortfolioAssetService,
    private readonly currencyConverterService: CurrencyConverterService,
  ) {}

  async findByUserId(userId: string) {
    return this.portfolioRepository.findOne({
      where: { user: { id: userId } },
      relations: ['assets', 'user'],
    });
  }

  async createPortfolio(userId: ID, dto: CreatePortfolioDto) {
    const userAssets = await this.userAssetService.getUserAssetsByIds(userId, dto.userAssetsIds);

    const baseCurrencyCode = await this.settingsService.getBaseCurrencyCode();

    const portfolio = this.portfolioRepository.create({
      user: { id: userId },
      name: dto.name,
      description: dto.description,
      type: dto.type,
      currency: {
        code: baseCurrencyCode,
      },
    });

    await this.portfolioRepository.save(portfolio);

    const portfolioAssets = await this.portfolioAssetService.createManyPortfolioAssetsAndSave(
      portfolio.id,
      dto.userAssetsIds,
    );

    const userAssetsTotalInvestedConverted = await this.currencyConverterService.convertMany(
      userAssets.map((userAsset) => ({
        amount: userAsset.totalInvested,
        toCurrency: portfolio.currency.code,
        fromCurrency: userAsset.currencyCode,
      })),
    );

    const totalInvested = userAssetsTotalInvestedConverted.reduce(
      (acc, userAsset) => acc.add(userAsset.amount),
      new Big(0),
    );

    const userAssetsTotalWithdrawnConverted = await this.currencyConverterService.convertMany(
      userAssets.map((userAsset) => ({
        amount: userAsset.totalWithdrawn,
        toCurrency: portfolio.currency.code,
        fromCurrency: userAsset.currencyCode,
      })),
    );

    const totalWithdrawn = userAssetsTotalWithdrawnConverted.reduce(
      (acc, userAsset) => acc.add(userAsset.amount),
      new Big(0),
    );

    const userAssetsCostBasisConverted = await this.currencyConverterService.convertMany(
      userAssets.map((userAsset) => ({
        amount: userAsset.costBasis,
        toCurrency: portfolio.currency.code,
        fromCurrency: userAsset.currencyCode,
      })),
    );

    const costBasis = userAssetsCostBasisConverted.reduce(
      (acc, userAsset) => acc.add(userAsset.amount),
      new Big(0),
    );

    const userAssetsRealizedPnlConverted = await this.currencyConverterService.convertMany(
      userAssets.map((userAsset) => ({
        amount: userAsset.realizedPnl,
        toCurrency: portfolio.currency.code,
        fromCurrency: userAsset.currencyCode,
      })),
    );

    const realizedPnl = userAssetsRealizedPnlConverted.reduce(
      (acc, userAsset) => acc.add(userAsset.amount),
      new Big(0),
    );

    const snapshot = this.portfolioSnapshotRepository.create({
      portfolio: { id: portfolio.id },
      totalInvested: totalInvested.toFixed(8),
      totalWithdrawn: totalWithdrawn.toFixed(8),
      costBasis: costBasis.toFixed(8),
      realizedPnl: realizedPnl.toFixed(8),
    });

    await this.portfolioSnapshotRepository.save(snapshot);

    return portfolio;
  }
}
