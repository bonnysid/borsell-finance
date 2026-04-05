import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyCode, ID, PortfolioSummaryDtoShape } from '@packages/types';
import Big from 'big.js';
import { LessThanOrEqual, Repository } from 'typeorm';

import { CurrencyConverterService } from '@/modules/currency/services';
import { CreatePortfolioDto } from '@/modules/portfolio/dto';
import { SettingsService } from '@/modules/settings/services';
import { UserAssetEntity } from '@/modules/user-asset/entities';
import { UserAssetService } from '@/modules/user-asset/services';

import { PortfolioEntity, PortfolioSnapshotEntity } from '../entities';
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
      relations: ['assets', 'assets.userAsset', 'assets.userAsset.asset', 'user', 'currency'],
    });
  }

  async updatePortfolioMetrics(portfolioId: ID) {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['assets', 'assets.userAsset', 'assets.userAsset.asset', 'currency'],
    });

    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const userAssets = portfolio.assets.map((pa) => pa.userAsset);

    const metrics = await this.calculateMetrics(userAssets, portfolio.currencyCode);

    const hasChanged =
      portfolio.marketPrice !== metrics.marketPrice ||
      portfolio.costBasis !== metrics.costBasis ||
      portfolio.totalInvested !== metrics.totalInvested ||
      portfolio.totalWithdrawn !== metrics.totalWithdrawn ||
      portfolio.realizedPnl !== metrics.realizedPnl;

    if (hasChanged) {
      Object.assign(portfolio, metrics);
      portfolio.lastValuationAt = new Date();

      await this.portfolioRepository.save(portfolio);

      const snapshot = this.portfolioSnapshotRepository.create({
        portfolio: { id: portfolio.id },
        ...metrics,
      });

      await this.portfolioSnapshotRepository.save(snapshot);
    }

    return portfolio;
  }

  async getPortfolioSummary(
    userId: ID,
    targetCurrency: CurrencyCode,
  ): Promise<PortfolioSummaryDtoShape | null> {
    const portfolio = await this.findByUserId(userId);

    if (!portfolio) {
      return null;
    }

    const updatedPortfolio = await this.updatePortfolioMetrics(portfolio.id);

    const metrics = await this.calculateMetrics(
      updatedPortfolio.assets.map((pa) => pa.userAsset),
      targetCurrency,
    );

    // Calculate PnL Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastSnapshotBeforeToday = await this.portfolioSnapshotRepository.findOne({
      where: {
        portfolio: { id: portfolio.id },
        createdAt: LessThanOrEqual(startOfDay),
      },
      order: { createdAt: 'DESC' },
    });

    let pnlToday = new Big(0);
    let pnlTodayPercent = 0;

    if (lastSnapshotBeforeToday) {
      const currentMarketPrice = new Big(metrics.marketPrice);
      const previousMarketPrice = new Big(lastSnapshotBeforeToday.marketPrice);

      // Convert previous market price to target currency if needed
      const convertedPrevious = await this.currencyConverterService.convertAmount({
        amount: previousMarketPrice,
        fromCurrency: portfolio.currencyCode, // Snapshots are in portfolio base currency
        toCurrency: targetCurrency,
      });

      pnlToday = currentMarketPrice.minus(convertedPrevious.amount);
      if (!convertedPrevious.amount.eq(0)) {
        pnlTodayPercent = pnlToday.div(convertedPrevious.amount).mul(100).toNumber();
      }
    }

    return {
      ...metrics,
      pnlToday: pnlToday.toFixed(8),
      pnlTodayPercent,
      currencyCode: targetCurrency,
    };
  }

  private async calculateMetrics(userAssets: UserAssetEntity[], targetCurrency: CurrencyCode) {
    const totalInvestedConverted = await this.currencyConverterService.convertMany(
      userAssets.map((ua) => ({
        amount: ua.totalInvested,
        toCurrency: targetCurrency,
        fromCurrency: ua.currencyCode,
      })),
    );
    const totalInvested = totalInvestedConverted.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Big(0),
    );

    const totalWithdrawnConverted = await this.currencyConverterService.convertMany(
      userAssets.map((ua) => ({
        amount: ua.totalWithdrawn,
        toCurrency: targetCurrency,
        fromCurrency: ua.currencyCode,
      })),
    );
    const totalWithdrawn = totalWithdrawnConverted.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Big(0),
    );

    const costBasisConverted = await this.currencyConverterService.convertMany(
      userAssets.map((ua) => ({
        amount: ua.costBasis,
        toCurrency: targetCurrency,
        fromCurrency: ua.currencyCode,
      })),
    );
    const costBasis = costBasisConverted.reduce((acc, curr) => acc.add(curr.amount), new Big(0));

    const realizedPnlConverted = await this.currencyConverterService.convertMany(
      userAssets.map((ua) => ({
        amount: ua.realizedPnl,
        toCurrency: targetCurrency,
        fromCurrency: ua.currencyCode,
      })),
    );
    const realizedPnl = realizedPnlConverted.reduce(
      (acc, curr) => acc.add(curr.amount),
      new Big(0),
    );

    const marketPriceElements = await Promise.all(
      userAssets.map(async (ua) => {
        const marketPrice = new Big(ua.asset.cachedMarketPrice).mul(ua.quantity);
        const converted = await this.currencyConverterService.convertAmount({
          amount: marketPrice,
          fromCurrency: ua.asset.currencyCode,
          toCurrency: targetCurrency,
        });
        return converted.amount;
      }),
    );
    const marketPrice = marketPriceElements.reduce((acc, curr) => acc.add(curr), new Big(0));

    return {
      totalInvested: totalInvested.toFixed(8),
      totalWithdrawn: totalWithdrawn.toFixed(8),
      costBasis: costBasis.toFixed(8),
      realizedPnl: realizedPnl.toFixed(8),
      marketPrice: marketPrice.toFixed(8),
    };
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
      marketPrice: '0',
      costBasis: '0',
      totalInvested: '0',
      totalWithdrawn: '0',
      realizedPnl: '0',
    });

    await this.portfolioRepository.save(portfolio);

    await this.portfolioAssetService.createManyPortfolioAssetsAndSave(
      portfolio.id,
      dto.userAssetsIds,
    );

    return this.updatePortfolioMetrics(portfolio.id);
  }
}
