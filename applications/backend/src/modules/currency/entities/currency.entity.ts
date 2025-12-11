import { CurrencyType } from '@packages/types';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('currencies')
export class CurrencyEntity {
  // Используем ISO код как ID (USD, EUR, BTC, RUB), так проще искать
  @PrimaryColumn()
  code: string;

  @Column()
  name: string; // "United States Dollar", "Bitcoin"

  @Column({ nullable: true })
  symbol: string; // "$", "₽", "₿"

  @Column({ type: 'enum', enum: CurrencyType })
  type: CurrencyType;

  // Самое важное поле: Курс к базовой валюте (например, к USD)
  // Если code = USD, rate = 1.0
  // Если code = RUB, rate = 0.011 (условно)
  // Тип decimal обязателен для денег!
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 1 })
  rateToBase: number;

  @UpdateDateColumn()
  updatedAt: string; // Чтобы знать, не протух ли курс
}
