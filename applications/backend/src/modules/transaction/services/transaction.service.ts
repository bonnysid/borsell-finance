import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CurrencyCode, ID, NumberString, TransactionType } from '@packages/types';
import Big from 'big.js';
import { DataSource, Repository } from 'typeorm';

import { UserAssetEntity } from '@/modules/user-asset/entities';

import { GetTransactionsDto } from '../dto';
import { TransactionEntity } from '../entities';

export type CreateTransactionDto = {
  userId: ID;
  assetId: ID;
  currencyCode: CurrencyCode;
  type: TransactionType;
  quantity: NumberString;
  price: NumberString;
  executedAt: Date;
};

@Injectable()
export class TransactionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
  ) {}

  async getTransactions(
    userId: ID,
    query: GetTransactionsDto,
  ): Promise<[TransactionEntity[], number]> {
    const { page = 1, limit = 20, assetId, type, currencyCode } = query;
    const skip = (page - 1) * limit;

    const qb = this.transactionRepo
      .createQueryBuilder('op')
      .innerJoinAndSelect('op.userAsset', 'ua')
      .leftJoinAndSelect('ua.asset', 'asset')
      .where('ua.userId = :userId', { userId });

    if (assetId) {
      qb.andWhere('ua.assetId = :assetId', { assetId });
    }

    if (type) {
      qb.andWhere('op.type = :type', { type });
    }

    if (currencyCode) {
      qb.andWhere('op.currencyCode = :currencyCode', { currencyCode });
    }

    qb.orderBy('op.executedAt', 'DESC').addOrderBy('op.createdAt', 'DESC').skip(skip).take(limit);

    return qb.getManyAndCount();
  }

  async createTransaction(dto: CreateTransactionDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1) get/create агрегат с lock
      let ua = await manager.findOne(UserAssetEntity, {
        where: {
          user: { id: dto.userId },
          asset: { id: dto.assetId },
          currencyCode: dto.currencyCode,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!ua) {
        ua = manager.create(UserAssetEntity, {
          user: { id: dto.userId },
          asset: { id: dto.assetId },
          currencyCode: dto.currencyCode,
          quantity: '0',
          avgBuyPrice: '0',
          costBasis: '0',
          totalInvested: '0',
          totalWithdrawn: '0',
          realizedPnl: '0',
        });
        ua = await manager.save(ua);
      }

      const dQty = new Big(dto.quantity);
      const dPrice = new Big(dto.price);
      const dAmount = dQty.mul(dPrice);

      // 2) сохраняем операцию
      const op = manager.create(TransactionEntity, {
        userAssetId: ua.id,
        type: dto.type,
        quantity: dto.quantity,
        price: dto.price,
        amount: dAmount.toFixed(8),
        executedAt: dto.executedAt,
        currencyCode: dto.currencyCode,
      });
      await manager.save(op);

      // 3) пересчёт агрегата
      const qty = new Big(ua.quantity);
      const avg = new Big(ua.avgBuyPrice);
      const costBasis = new Big(ua.costBasis);
      const invested = new Big(ua.totalInvested);
      const withdrawn = new Big(ua.totalWithdrawn);
      const realized = new Big(ua.realizedPnl);

      if (dto.type === TransactionType.BUY) {
        const addCost = dAmount;
        const newQty = qty.plus(dQty);
        const newCostBasis = costBasis.plus(addCost);
        const newAvg = newQty.eq(0) ? new Big(0) : newCostBasis.div(newQty);

        ua.quantity = newQty.toFixed(8);
        ua.costBasis = newCostBasis.toFixed(8);
        ua.avgBuyPrice = newAvg.toFixed(8);
        ua.totalInvested = invested.plus(addCost).toFixed(8);
      } else if (dto.type === TransactionType.TRANSFER_OUT) {
        if (dQty.gt(qty)) throw new Error('Not enough quantity to transfer');

        const transferredCost = avg.mul(dQty);
        const newQty = qty.minus(dQty);

        ua.quantity = newQty.toFixed(8);

        if (newQty.eq(0)) {
          ua.costBasis = '0';
          ua.avgBuyPrice = '0';
        } else {
          const newCostBasis = costBasis.minus(transferredCost);
          ua.costBasis = newCostBasis.toFixed(8);
          ua.avgBuyPrice = newCostBasis.div(newQty).toFixed(8);
        }

        // ВАЖНО: не трогаем totalWithdrawn и realizedPnl
      } else {
        if (dQty.gt(qty)) throw new Error('Not enough quantity to sell');

        const proceeds = dAmount;
        const soldCost = avg.mul(dQty);

        const newQty = qty.minus(dQty);
        const newRealized = realized.plus(proceeds.minus(soldCost));

        ua.quantity = newQty.toFixed(8);
        ua.totalWithdrawn = withdrawn.plus(proceeds).toFixed(8);
        ua.realizedPnl = newRealized.toFixed(8);

        if (newQty.eq(0)) {
          ua.costBasis = '0';
          ua.avgBuyPrice = '0';
        } else {
          const newCostBasis = costBasis.minus(soldCost);
          ua.costBasis = newCostBasis.toFixed(8);
          ua.avgBuyPrice = newCostBasis.div(newQty).toFixed(8);
        }
      }

      await manager.save(ua);
      return ua;
    });
  }
}
