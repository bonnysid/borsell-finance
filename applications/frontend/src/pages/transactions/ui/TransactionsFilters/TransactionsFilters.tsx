import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './TransactionsFilters.module.scss';

type TransactionsFiltersProps = {};

const cx = bindStyles(styles);

export const TransactionsFilters: FC<TransactionsFiltersProps> = ({}) => {
  return <div className={cx('transactions-filters')}>filters</div>;
};
