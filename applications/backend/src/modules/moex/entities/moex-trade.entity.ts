import { NumberString } from '@packages/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DateColumn, PriceColumn } from '@/common';

@Entity('moex_trades')
@Index(['tradeNo'], { unique: true })
@Index(['engineName', 'marketName'])
@Index(['secId'])
export class MoexTradeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trade_no', type: 'bigint' })
  tradeNo!: string;

  @Column({ name: 'sec_id', type: 'varchar', length: 255 })
  secId!: string;

  @Column({ name: 'board_id', type: 'varchar', length: 255 })
  boardId!: string;

  @PriceColumn()
  price!: NumberString;

  @PriceColumn({ nullable: true })
  value?: NumberString | null;

  @Column({ name: 'decimals', type: 'integer', nullable: true })
  decimals?: number | null;

  @DateColumn({ name: 'trade_date' })
  tradeDate!: string;

  @Column({ name: 'trade_time', type: 'time' })
  tradeTime!: string;

  @Column({ name: 'sys_time', type: 'timestamp' })
  sysTime!: Date;

  @Column({ name: 'trade_session_date', type: 'date', nullable: true })
  tradeSessionDate?: string | null;

  @Column({ name: 'engine_name', type: 'varchar', length: 255 })
  engineName!: string;

  @Column({ name: 'market_name', type: 'varchar', length: 255 })
  marketName!: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
