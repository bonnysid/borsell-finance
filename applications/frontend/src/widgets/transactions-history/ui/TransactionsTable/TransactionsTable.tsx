import {
  formatNumber,
  Table,
  TableColumnType,
  TableDataItem,
  UsePaginationReturn,
} from '@devbonnysid/ui-kit-default';
import { AssetCell } from '@entities/assets';
import { TransactionTypeCell } from '@entities/transaction';
import { TransactionDtoShape } from '@packages/types';
import { AmountText } from '@shared/ui/AmountText';
import { formatDateDDMMYYYYHHMM } from '@shared/utils';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type TransactionsTableProps = {
  data: TransactionDtoShape[];
  isLoading?: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  pagination?: UsePaginationReturn;
};

export const TransactionsTable: FC<TransactionsTableProps> = ({
  pagination,
  isFetching,
  isLoading,
  isEmpty,
  data,
}) => {
  const { t } = useTranslation();

  const columns = useMemo<TableColumnType<TransactionDtoShape>[]>(() => {
    return [
      {
        key: 'executedAt',
        title: t('Date'),
        render: (date) => formatDateDDMMYYYYHHMM(date),
      },
      {
        key: 'asset',
        title: t('Asset'),
        render: (asset) => {
          if (asset) {
            return <AssetCell asset={asset} />;
          }
        },
      },
      {
        key: 'type',
        title: t(`operationType.title`),
        render: (type) => {
          return <TransactionTypeCell type={type} />;
        },
      },
      {
        key: 'quantity',
        title: t('Quantity'),
        render: (quantity) => formatNumber(quantity, 0),
      },
      {
        key: 'price',
        title: t('Price'),
        render: (price, { currencyCode }) => {
          return <AmountText amount={price} currency={currencyCode} />;
        },
      },
      {
        key: 'amount',
        title: t('Amount'),
        render: (amount, { currencyCode }) => {
          return <AmountText amount={amount} currency={currencyCode} />;
        },
      },
    ];
  }, [t]);

  const rowKey = useCallback((record: TransactionDtoShape) => {
    return record.id;
  }, []);

  return (
    <Table<TableDataItem<TransactionDtoShape>>
      data={data}
      columns={columns}
      rowKey={rowKey}
      isLoading={isLoading}
      isFetching={isFetching}
      isEmpty={isEmpty}
      pagination={pagination}
      skeletonHeights={49}
    ></Table>
  );
};
