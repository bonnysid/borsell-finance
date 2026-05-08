import {
  bindStyles,
  ColumnAlignVariants,
  Table,
  TableColumnType,
  usePagination,
} from '@devbonnysid/ui-kit-default';
import { AssetCell, useGetAssets } from '@entities/assets';
import { AssetDtoShape, AssetType } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { PageTitle, PageWrapper, PercentText } from '@shared/ui';
import { AmountText } from '@shared/ui/AmountText';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './AssetsStocksPage.module.scss';

type AssetsStocksPageProps = {};

const cx = bindStyles(styles);

export const AssetsStocksPage: FC<AssetsStocksPageProps> = ({}) => {
  const pagination = usePagination({
    initialPageSize: 15,
  });

  const { data, isLoading, isFetching } = useGetAssets({
    page: pagination.page,
    limit: pagination.pageSize,
    type: AssetType.STOCK,
  });

  const isEmpty = data?.totalItems === 0;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = useMemo<TableColumnType<AssetDtoShape>[]>(() => {
    return [
      {
        key: 'custom-column-asset',
        title: t('Asset'),
        render: (_, asset) => <AssetCell asset={asset} />,
      },
      {
        key: 'cachedMarketPrice',
        title: t('Price'),
        align: ColumnAlignVariants.RIGHT,
        render: (cachedMarketPrice, { currencyCode }) => (
          <AmountText amount={cachedMarketPrice} currency={currencyCode} />
        ),
      },
      {
        key: 'changePercent24h',
        title: t('change_24h'),
        align: ColumnAlignVariants.RIGHT,
        render: (changePercent24h) => <PercentText value={changePercent24h} />,
      },
      {
        key: 'volume',
        title: t('Volume'),
        align: ColumnAlignVariants.RIGHT,
        render: (volume, { currencyCode }) => {
          return <AmountText amount={volume} currency={currencyCode} />;
        },
      },
    ];
  }, [t]);

  const rowKey = useCallback((asset: AssetDtoShape) => {
    return asset.id;
  }, []);

  const handleRowClick = (record: AssetDtoShape) => {
    navigate(AppRoutePaths.ASSETS_DETAILS({ symbol: record.symbol }));
  };

  useEffect(() => {
    pagination.setTotalItems(data?.totalItems || 0);
  }, [data?.totalItems]);

  return (
    <PageWrapper className={cx('assets-stocks-page')}>
      <PageTitle>{t('Stocks')}</PageTitle>

      <Table
        columns={columns}
        rowKey={rowKey}
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={isEmpty}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </PageWrapper>
  );
};

export default AssetsStocksPage;
