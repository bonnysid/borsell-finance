import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyCode, ID, PortfolioSummaryDtoShape, TransactionType } from '@packages/types';
import Big from 'big.js';
import { addDays, startOfMonth } from 'date-fns';
import { Between, LessThanOrEqual, Repository } from 'typeorm';

import { formatDateToSqlDate, normalizeDate } from '@/common/utils/date.utils';
import { AssetService } from '@/modules/asset/services';
import { CurrencyConverterService } from '@/modules/currency/services';
import {
  CreatePortfolioDto,
  PortfolioAllocationDto,
  PortfolioAllocationItemDto,
  PortfolioHistoryDto,
  PortfolioHistoryItemDto,
} from '@/modules/portfolio/dto';
import { SettingsService } from '@/modules/settings/services';
import { UserAssetEntity } from '@/modules/user-asset/entities';
import { UserAssetService } from '@/modules/user-asset/services';

import { PortfolioEntity, PortfolioSnapshotEntity } from '../entities';
import { PortfolioAssetService } from './protfolio-asset.service';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(PortfolioSnapshotEntity)
    private readonly portfolioSnapshotRepository: Repository<PortfolioSnapshotEntity>,
    private readonly userAssetService: UserAssetService,
    private readonly settingsService: SettingsService,
    private readonly portfolioAssetService: PortfolioAssetService,
    private readonly currencyConverterService: CurrencyConverterService,
    private readonly assetService: AssetService,
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

    try {
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

        const createdAt = formatDateToSqlDate(normalizeDate(new Date()));

        let snapshot = await this.portfolioSnapshotRepository.findOne({
          where: { createdAt, portfolio: { id: portfolio.id } },
        });

        if (!snapshot) {
          snapshot = this.portfolioSnapshotRepository.create({
            portfolio: { id: portfolio.id },
            ...metrics,
            createdAt,
          });
        } else {
          snapshot.costBasis = metrics.costBasis;
          snapshot.totalInvested = metrics.totalInvested;
          snapshot.realizedPnl = metrics.realizedPnl;
          snapshot.totalWithdrawn = metrics.totalWithdrawn;
          snapshot.marketPrice = metrics.marketPrice;
        }

        await this.portfolioSnapshotRepository.save(snapshot);
      }
    } catch (e) {
      this.logger.error(`Failed to update portfolio metrics: ${e.message}`);
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

    const monthStart = startOfMonth(new Date());

    const lastSnapshotBeforeMonthStart = await this.portfolioSnapshotRepository.findOne({
      where: {
        portfolio: { id: portfolio.id },
        createdAt: LessThanOrEqual(formatDateToSqlDate(monthStart)),
      },
      order: { createdAt: 'DESC' },
    });

    let pnlMonth = new Big(0);
    let pnlMonthPercent = 0;

    if (lastSnapshotBeforeMonthStart) {
      const currentMarketPrice = new Big(metrics.marketPrice);
      const previousMarketPrice = new Big(lastSnapshotBeforeMonthStart.marketPrice);

      // Convert previous market price to target currency if needed
      const convertedPrevious = await this.currencyConverterService.convertAmount({
        amount: previousMarketPrice,
        fromCurrency: portfolio.currencyCode, // Snapshots are in portfolio base currency
        toCurrency: targetCurrency,
      });

      pnlMonth = currentMarketPrice.minus(convertedPrevious.amount);
      if (!convertedPrevious.amount.eq(0)) {
        pnlMonthPercent = pnlMonth.div(convertedPrevious.amount).mul(100).toNumber();
      }
    }

    return {
      ...metrics,
      pnlMonth: pnlMonth.toFixed(8),
      pnlMonthPercent,
      currencyCode: targetCurrency,
    };
  }

  async getPortfolioAllocation(
    userId: ID,
    targetCurrency: CurrencyCode,
  ): Promise<PortfolioAllocationDto | null> {
    const portfolio = await this.findByUserId(userId);

    if (!portfolio) {
      return null;
    }

    const updatedPortfolio = await this.updatePortfolioMetrics(portfolio.id);
    const userAssets = updatedPortfolio.assets.map((pa) => pa.userAsset);

    const allocationItems: PortfolioAllocationItemDto[] = [];
    let totalValue = new Big(0);

    for (const ua of userAssets) {
      const marketPrice = new Big(ua.asset.cachedMarketPrice).mul(ua.quantity);
      const converted = await this.currencyConverterService.convertAmount({
        amount: marketPrice,
        fromCurrency: ua.asset.currencyCode,
        toCurrency: targetCurrency,
      });

      totalValue = totalValue.add(converted.amount);

      allocationItems.push(
        new PortfolioAllocationItemDto({
          id: ua.asset.id,
          name: ua.asset.name,
          symbol: ua.asset.symbol,
          value: converted.amount.toNumber(),
          percentage: 0, // Calculate later
        }),
      );
    }

    if (totalValue.gt(0)) {
      allocationItems.forEach((item) => {
        item.percentage = new Big(item.value).div(totalValue).mul(100).toNumber();
      });
    }

    return new PortfolioAllocationDto({
      items: allocationItems.sort((a, b) => b.value - a.value),
      totalValue: totalValue.toNumber(),
      currencyCode: targetCurrency,
    });
  }

  async getPortfolioHistory(
    userId: ID,
    targetCurrency: CurrencyCode,
  ): Promise<PortfolioHistoryDto | null> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { user: { id: userId } },
      relations: [
        'assets',
        'assets.userAsset',
        'assets.userAsset.asset',
        'assets.userAsset.transactions',
      ],
    });

    if (!portfolio) {
      return null;
    }

    const userAssets = portfolio.assets.map((pa) => pa.userAsset);

    // Find the earliest transaction date
    let earliestDate: Date | null = null;
    for (const ua of userAssets) {
      for (const tx of ua.transactions) {
        if (!earliestDate || tx.executedAt < earliestDate) {
          earliestDate = tx.executedAt;
        }
      }
    }

    if (!earliestDate) {
      return new PortfolioHistoryDto({ items: [], currencyCode: targetCurrency });
    }

    const startDate = normalizeDate(earliestDate);
    const today = normalizeDate(new Date());

    // Generate dates from startDate to yesterday
    const dates: Date[] = [];
    let current = new Date(startDate);
    while (current < today) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }

    if (dates.length === 0) {
      return new PortfolioHistoryDto({ items: [], currencyCode: targetCurrency });
    }

    // Check existing snapshots in this range
    const existingSnapshots = await this.portfolioSnapshotRepository.find({
      where: {
        portfolio: { id: portfolio.id },
        createdAt: Between(
          formatDateToSqlDate(dates[0]),
          formatDateToSqlDate(dates[dates.length - 1]),
        ),
      },
      order: { createdAt: 'ASC' },
    });

    const snapshotsByDate = new Map<string, PortfolioSnapshotEntity>();

    for (const s of existingSnapshots) {
      snapshotsByDate.set(s.createdAt, s);
    }

    // Fetch historical prices for all assets in the range
    const assetSymbols = [...new Set(userAssets.map((ua) => ua.asset.symbol))];
    const historicalPricesMap = new Map<string, Map<string, Big>>(); // symbol -> date -> price

    const batchHistory = await this.assetService.getAssetsPriceHistoryBatch(assetSymbols, {
      from: dates[0],
      to: dates[dates.length - 1],
    });

    for (const symbol of assetSymbols) {
      const history = batchHistory.get(symbol) || [];
      const dateMap = new Map<string, Big>();
      let lastPrice: Big | null = null;

      const historyMap = new Map<string, Big>();
      for (const h of history) {
        historyMap.set(formatDateToSqlDate(h.date), new Big(h.closePrice));
      }

      for (const date of dates) {
        const dStr = formatDateToSqlDate(date);
        const price = historyMap.get(dStr);
        if (price) {
          lastPrice = price;
        }
        if (lastPrice) {
          dateMap.set(dStr, lastPrice);
        }
      }

      historicalPricesMap.set(symbol, dateMap);
    }

    const items: PortfolioHistoryItemDto[] = [];
    const snapshotsToSave: PortfolioSnapshotEntity[] = [];

    for (const date of dates) {
      const dateStr = formatDateToSqlDate(date);
      const existingSnapshot = snapshotsByDate.get(dateStr);

      if (existingSnapshot) {
        // Convert metrics to target currency
        const convert = async (amount: string | number) => {
          const result = await this.currencyConverterService.convertAmount({
            amount: new Big(amount),
            fromCurrency: portfolio.currencyCode,
            toCurrency: targetCurrency,
          });
          return result.amount.toFixed(8);
        };

        items.push(
          new PortfolioHistoryItemDto({
            marketPrice: await convert(existingSnapshot.marketPrice),
            costBasis: await convert(existingSnapshot.costBasis),
            totalInvested: await convert(existingSnapshot.totalInvested),
            totalWithdrawn: await convert(existingSnapshot.totalWithdrawn),
            realizedPnl: await convert(existingSnapshot.realizedPnl),
            createdAt: formatDateToSqlDate(normalizeDate(existingSnapshot.createdAt)),
          }),
        );
        continue;
      }

      let dayMarketPrice = new Big(0);
      let dayCostBasis = new Big(0);
      let dayTotalInvested = new Big(0);
      let dayTotalWithdrawn = new Big(0);
      let dayRealizedPnl = new Big(0);

      for (const ua of userAssets) {
        const txsBeforeOrOnDay = ua.transactions
          .filter((tx) => normalizeDate(tx.executedAt) <= date)
          .sort((a, b) => a.executedAt.getTime() - b.executedAt.getTime());

        if (txsBeforeOrOnDay.length === 0) continue;

        let quantity = new Big(0);
        let costBasis = new Big(0);
        let invested = new Big(0);
        let withdrawn = new Big(0);
        let realizedPnl = new Big(0);

        for (const tx of txsBeforeOrOnDay) {
          const txQty = new Big(tx.quantity);
          const txAmount = new Big(tx.amount);

          if (tx.type === TransactionType.BUY) {
            costBasis = costBasis.add(txAmount);
            quantity = quantity.add(txQty);
            invested = invested.add(txAmount);
          } else if (tx.type === TransactionType.SELL) {
            if (quantity.gt(0)) {
              const avgPrice = costBasis.div(quantity);
              const soldCostBasis = txQty.mul(avgPrice);
              costBasis = costBasis.minus(soldCostBasis);
              realizedPnl = realizedPnl.add(txAmount.minus(soldCostBasis));
            }
            quantity = quantity.minus(txQty);
            withdrawn = withdrawn.add(txAmount);
          }
        }

        // Market Price for this asset on this day (base currency of asset)
        const priceOnDay = historicalPricesMap.get(ua.asset.symbol)?.get(dateStr);
        if (priceOnDay && quantity.gt(0)) {
          const assetMarketPrice = quantity.mul(priceOnDay);
          // Convert to portfolio base currency for snapshot
          const convertedToPortfolioBase = await this.currencyConverterService.convertAmount({
            amount: assetMarketPrice,
            fromCurrency: ua.asset.currencyCode,
            toCurrency: portfolio.currencyCode,
          });
          dayMarketPrice = dayMarketPrice.add(convertedToPortfolioBase.amount);
        }

        // Convert other metrics to portfolio base currency
        const convertToBase = async (amt: Big) => {
          const res = await this.currencyConverterService.convertAmount({
            amount: amt,
            fromCurrency: ua.currencyCode,
            toCurrency: portfolio.currencyCode,
          });
          return res.amount;
        };

        dayCostBasis = dayCostBasis.add(await convertToBase(costBasis));
        dayTotalInvested = dayTotalInvested.add(await convertToBase(invested));
        dayTotalWithdrawn = dayTotalWithdrawn.add(await convertToBase(withdrawn));
        dayRealizedPnl = dayRealizedPnl.add(await convertToBase(realizedPnl));
      }

      // Save snapshot in portfolio base currency
      this.logger.log(`Creating snapshot for ${dateStr} for portfolio ${portfolio.id}`);
      const snapshot = this.portfolioSnapshotRepository.create({
        portfolio: { id: portfolio.id },
        marketPrice: dayMarketPrice.toFixed(8),
        costBasis: dayCostBasis.toFixed(8),
        totalInvested: dayTotalInvested.toFixed(8),
        totalWithdrawn: dayTotalWithdrawn.toFixed(8),
        realizedPnl: dayRealizedPnl.toFixed(8),
        createdAt: formatDateToSqlDate(date),
      });
      snapshotsToSave.push(snapshot);

      // Convert metrics for response DTO
      const convertToTarget = async (amt: Big) => {
        const res = await this.currencyConverterService.convertAmount({
          amount: amt,
          fromCurrency: portfolio.currencyCode,
          toCurrency: targetCurrency,
        });
        return res.amount.toFixed(8);
      };

      items.push(
        new PortfolioHistoryItemDto({
          marketPrice: await convertToTarget(dayMarketPrice),
          costBasis: await convertToTarget(dayCostBasis),
          totalInvested: await convertToTarget(dayTotalInvested),
          totalWithdrawn: await convertToTarget(dayTotalWithdrawn),
          realizedPnl: await convertToTarget(dayRealizedPnl),
          createdAt: formatDateToSqlDate(normalizeDate(date)),
        }),
      );
    }

    if (snapshotsToSave.length > 0) {
      await this.portfolioSnapshotRepository.save(snapshotsToSave);
      portfolio.historyLastUpdatedAt = new Date();
      await this.portfolioRepository.save(portfolio);
    }

    return new PortfolioHistoryDto({
      items,
      currencyCode: targetCurrency,
    });
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
    await this.userAssetService.getUserAssetsByIds(userId, dto.userAssetsIds);

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
