import { Column, type ColumnOptions } from 'typeorm';

type PriceColumnOptions = Omit<ColumnOptions, 'type' | 'precision' | 'scale'> & {
  precision?: number;
  scale?: number;
};

export const NumericColumn = (options: PriceColumnOptions = {}) =>
  Column({
    type: 'numeric',
    precision: 30,
    scale: 8,
    default: '0',
    ...options,
  });

export const PriceColumn = (options: PriceColumnOptions = {}) =>
  NumericColumn({ precision: 30, scale: 8, ...options });

export const AmountColumn = (options: PriceColumnOptions = {}) =>
  NumericColumn({ scale: 8, ...options });

export const QuantityColumn = (options: PriceColumnOptions = {}) =>
  NumericColumn({ scale: 8, ...options });
