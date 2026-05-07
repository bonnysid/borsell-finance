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

import styles from './AssetsPage.module.scss';

type AssetsPageProps = {};

const cx = bindStyles(styles);

export const AssetsPage: FC<AssetsPageProps> = ({}) => {
  const pagination = usePagination({
    initialPageSize: 15,
  });

  const {
    data: paginatedData,
    isLoading: isPaginatedLoading,
    isFetching: isPaginatedFetching,
  } = useGetAssets({
    page: pagination.page,
    limit: pagination.pageSize,
    type: AssetType.STOCK,
  });

  const currentData = paginatedData;
  const currentLoading = isPaginatedLoading;
  const currentFetching = isPaginatedFetching;

  const isEmpty = currentData?.totalItems === 0;

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
      // {
      //   key: 'changePercent1h',
      //   title: t('change_1h'),
      //   align: ColumnAlignVariants.RIGHT,
      //   render: (changePercent1h) => <PercentText value={changePercent1h} />,
      // },
      {
        key: 'changePercent24h',
        title: t('change_24h'),
        align: ColumnAlignVariants.RIGHT,
        render: (changePercent24h) => <PercentText value={changePercent24h} />,
      },
      // {
      //   key: 'changePercent7d',
      //   title: t('change_7d'),
      //   align: ColumnAlignVariants.RIGHT,
      //   render: (changePercent7d) => <PercentText value={changePercent7d} />,
      // },
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

  const rowKey = useCallback((userAsset: AssetDtoShape) => {
    return userAsset.id;
  }, []);

  const handleRowClick = (record: AssetDtoShape) => {
    navigate(AppRoutePaths.ASSETS_DETAILS({ symbol: record.symbol }));
  };

  useEffect(() => {
    pagination.setTotalItems(currentData?.totalItems || 0);
  }, [currentData?.totalItems]);

  return (
    <PageWrapper className={cx('assets-page')}>
      <PageTitle>{t('Assets')}</PageTitle>

      <Table
        columns={columns}
        rowKey={rowKey}
        data={currentData?.data}
        isLoading={currentLoading}
        isFetching={currentFetching}
        isEmpty={isEmpty}
        onRowClick={handleRowClick}
        pagination={pagination}
      />
    </PageWrapper>
  );
};

export default AssetsPage;
