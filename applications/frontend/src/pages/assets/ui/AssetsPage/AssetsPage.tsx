import {
  bindStyles,
  ColumnAlignVariants,
  Table,
  TableColumnType,
} from '@devbonnysid/ui-kit-default';
import { AssetCell, useGetAssets } from '@entities/assets';
import { AssetWithHistoryDtoShape } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { PageTitle, PageWrapper, PercentText, Sparkline } from '@shared/ui';
import { AmountText } from '@shared/ui/AmountText';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './AssetsPage.module.scss';

type AssetsPageProps = {};

const cx = bindStyles(styles);

export const AssetsPage: FC<AssetsPageProps> = ({}) => {
  const { data, isLoading, isFetching } = useGetAssets();
  const isEmpty = data?.totalItems === 0;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = useMemo<TableColumnType<AssetWithHistoryDtoShape>[]>(() => {
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
        key: 'changePercent1h',
        title: t('change_1h'),
        align: ColumnAlignVariants.RIGHT,
        render: (changePercent1h) => <PercentText value={changePercent1h} />,
      },
      {
        key: 'changePercent24h',
        title: t('change_24h'),
        align: ColumnAlignVariants.RIGHT,
        render: (changePercent24h) => <PercentText value={changePercent24h} />,
      },
      {
        key: 'changePercent7d',
        title: t('change_7d'),
        align: ColumnAlignVariants.RIGHT,
        render: (changePercent7d) => <PercentText value={changePercent7d} />,
      },
      {
        key: 'volume',
        title: t('Volume'),
        align: ColumnAlignVariants.RIGHT,
        render: (volume) => <AmountText amount={volume} />,
      },
      {
        key: 'custom-column-sparkline',
        title: t('Last 7 days'),
        render: (_, asset) => {
          const sparklineData = asset.history
            .map((h) => ({
              time: new Date(h.date),
              value: Number(h.closePrice),
            }))
            .sort((a, b) => a.time.getTime() - b.time.getTime());

          if (sparklineData.length === 0) return null;

          return (
            <div className={cx('sparkline-wrapper')}>
              <Sparkline data={sparklineData} />
            </div>
          );
        },
      },
    ];
  }, [t]);

  const rowKey = useCallback((userAsset: AssetWithHistoryDtoShape) => {
    return userAsset.id;
  }, []);

  const handleRowClick = (record: AssetWithHistoryDtoShape) => {
    navigate(AppRoutePaths.ASSETS_DETAILS({ symbol: record.symbol }));
  };

  return (
    <PageWrapper className={cx('assets-page')}>
      <PageTitle>{t('Assets')}</PageTitle>

      <Table
        columns={columns}
        rowKey={rowKey}
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={isEmpty}
        onRowClick={handleRowClick}
      />
    </PageWrapper>
  );
};

export default AssetsPage;
