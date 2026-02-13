import { bindStyles, usePagination } from '@devbonnysid/ui-kit-default';
import { useGetTransactions } from '@entities/transaction';
import { FC } from 'react';

import { TransactionsFilters } from '../TransactionsFilters';
import { TransactionsTable } from '../TransactionsTable';
import styles from './TransactionsPage.module.scss';

type TransactionsPageProps = {};

const cn = bindStyles(styles);

export const TransactionsPage: FC<TransactionsPageProps> = () => {
  const { data, isLoading, isFetching } = useGetTransactions();
  const pagination = usePagination({
    totalItems: data?.totalItems || 0,
  });

  return (
    <div className={cn('transactions-page')}>
      <TransactionsFilters />
      <TransactionsTable
        data={data?.data || []}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={data?.totalItems === 0}
        pagination={pagination}
      />
    </div>
  );
};

export default TransactionsPage;
