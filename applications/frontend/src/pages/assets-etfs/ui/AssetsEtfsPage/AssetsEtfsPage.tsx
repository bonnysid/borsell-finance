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

import styles from './AssetsEtfsPage.module.scss';

type AssetsEtfsPageProps = {};

const cx = bindStyles(styles);

export const AssetsEtfsPage: FC<AssetsEtfsPageProps> = ({}) => {
  const pagination = usePagination({
    initialPageSize: 15,
  });

  const { data, isLoading, isFetching } = useGetAssets({
    page: pagination.page,
    limit: pagination.pageSize,
    type: AssetType.ETF,
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
        render: (volume, { currencyCode, metadata }) => {
          return <AmountText amount={metadata.valToday || volume} currency={currencyCode} />;
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
    <PageWrapper className={cx('assets-etfs-page')}>
      <PageTitle>{t('ETFs')}</PageTitle>

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

export default AssetsEtfsPage;
