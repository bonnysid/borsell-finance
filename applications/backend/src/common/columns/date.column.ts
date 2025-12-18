import { Column, type ColumnOptions } from 'typeorm';

type DateColumnOptions = Omit<ColumnOptions, 'type'> & {};

export const DateColumn = (options: DateColumnOptions = {}) =>
  Column({ type: 'timestamptz', ...options });
