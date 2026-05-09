import { usePagination } from '@devbonnysid/ui-kit-default';
import { useGetTransactions } from '@entities/transaction';
import { GetTransactionsDtoShape } from '@packages/types';
import { FC, useEffect } from 'react';

import { TransactionsTable } from '../TransactionsTable';

type TransactionsHistoryProps = GetTransactionsDtoShape & {};

export const TransactionsHistory: FC<TransactionsHistoryProps> = ({
  assetId,
  currencyCode,
  type,
  quantity,
  amount,
}) => {
  const pagination = usePagination({
    initialPageSize: 15,
  });

  const { data, isLoading, isFetching } = useGetTransactions({
    page: pagination.page,
    limit: pagination.pageSize,
    currencyCode,
    amount,
    quantity,
    type,
    assetId,
  });

  useEffect(() => {
    pagination.setTotalItems(data?.totalItems || 0);
  }, [data?.totalItems]);

  return (
    <TransactionsTable
      data={data?.data || []}
      isLoading={isLoading}
      isFetching={isFetching}
      isEmpty={data?.totalItems === 0}
      pagination={pagination}
    />
  );
};
