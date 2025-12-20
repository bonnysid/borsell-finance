import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CurrencyCode, ID, NumberString, UserAssetOperationType } from '@packages/types';
import Big from 'big.js';
import { DataSource, Repository } from 'typeorm';

import { UserAssetEntity, UserAssetOperationEntity } from '../entities';

export type ApplyOperationDto = {
  userId: ID;
  assetId: ID;
  currencyCode: CurrencyCode;
  type: UserAssetOperationType;
  quantity: NumberString;
  amount: NumberString;
  executedAt: Date;
};

@Injectable()
export class UserAssetService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserAssetEntity)
    private readonly userAssetRepo: Repository<UserAssetEntity>,
  ) {}

  async getUserAssets(userId: string): Promise<UserAssetEntity[]> {
    return this.userAssetRepo.find({ where: { user: { id: userId } }, relations: ['asset'] });
  }

  async applyOperation(dto: ApplyOperationDto) {
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
          userId: dto.userId,
          assetId: dto.assetId,
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

      // 2) сохраняем операцию
      const op = manager.create(UserAssetOperationEntity, {
        userAssetId: ua.id,
        type: dto.type,
        quantity: dto.quantity,
        amount: dto.amount,
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

      const dQty = new Big(dto.quantity);
      const dPrice = new Big(dto.amount);

      if (dto.type === UserAssetOperationType.BUY) {
        const addCost = dQty.mul(dPrice);
        const newQty = qty.plus(dQty);
        const newCostBasis = costBasis.plus(addCost);
        const newAvg = newQty.eq(0) ? new Big(0) : newCostBasis.div(newQty);

        ua.quantity = newQty.toFixed(8);
        ua.costBasis = newCostBasis.toFixed(8);
        ua.avgBuyPrice = newAvg.toFixed(8);
        ua.totalInvested = invested.plus(addCost).toFixed(8);
      } else if (dto.type === UserAssetOperationType.TRANSFER_OUT) {
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

        const proceeds = dQty.mul(dPrice);
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
