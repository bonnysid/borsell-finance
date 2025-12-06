import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './TransactionsPage.module.scss';

type TransactionsPageProps = {};

const cn = bindStyles(styles);

export const TransactionsPage: FC<TransactionsPageProps> = () => {
  return <div className={cn('transactions-page')}>Transactions</div>;
};

export default TransactionsPage;
