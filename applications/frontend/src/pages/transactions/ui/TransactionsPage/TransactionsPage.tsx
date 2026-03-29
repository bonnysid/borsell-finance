import { bindStyles } from '@devbonnysid/ui-kit-default';
import { TransactionsHistory } from '@widgets/transactions-history';
import { FC } from 'react';

import { TransactionsFilters } from '../TransactionsFilters';
import styles from './TransactionsPage.module.scss';

type TransactionsPageProps = {};

const cn = bindStyles(styles);

export const TransactionsPage: FC<TransactionsPageProps> = () => {
  return (
    <div className={cn('transactions-page')}>
      <TransactionsFilters />
      <TransactionsHistory />
    </div>
  );
};

export default TransactionsPage;
