import { CurrencyType, NumberString } from '@packages/types';
import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('currencies')
export class CurrencyEntity {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ type: 'enum', enum: CurrencyType })
  type: CurrencyType;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 1 })
  rateToBase: NumberString;

  @UpdateDateColumn()
  updatedAt: Date;
}
