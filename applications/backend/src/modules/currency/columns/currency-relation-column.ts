import { Column, type ColumnOptions, JoinColumn, ManyToOne, type RelationOptions } from 'typeorm';

import { CurrencyEntity } from '../entities';

type CurrencyRelationOptions = {
  joinColumnName?: string; // по умолчанию currencyCode
  relation?: RelationOptions;
};

type CurrencyCodeColumnOptions = Omit<ColumnOptions, 'type'> & {};

export const CurrencyRelationColumn = (opts: CurrencyRelationOptions = {}) => {
  const joinColumnName = opts.joinColumnName ?? 'currencyCode';

  return (target: object, propertyKey: string | symbol) => {
    ManyToOne(() => CurrencyEntity, opts.relation)(target, propertyKey as string);
    JoinColumn({ name: joinColumnName })(target, propertyKey as string);
  };
};

export const CurrencyCodeColumn = (opts: CurrencyCodeColumnOptions = {}) => {
  return Column({ type: 'varchar', ...opts });
};
