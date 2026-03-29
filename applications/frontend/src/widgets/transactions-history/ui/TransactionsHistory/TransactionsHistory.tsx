import { bindStyles, usePagination } from '@devbonnysid/ui-kit-default';
import { useGetTransactions } from '@entities/transaction';
import { GetTransactionsDtoShape } from '@packages/types';
import { FC } from 'react';

import { TransactionsTable } from '../TransactionsTable';
import styles from './TransactionsHistory.module.scss';

type TransactionsHistoryProps = GetTransactionsDtoShape & {};

const cx = bindStyles(styles);

export const TransactionsHistory: FC<TransactionsHistoryProps> = ({
  assetId,
  currencyCode,
  type,
  quantity,
  amount,
}) => {
  const { data, isLoading, isFetching } = useGetTransactions({
    currencyCode,
    amount,
    quantity,
    type,
    assetId,
  });
  const pagination = usePagination({
    totalItems: data?.totalItems || 0,
  });

  return (
    <div className={cx('transactions-history')}>
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
