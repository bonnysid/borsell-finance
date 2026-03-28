import {
  Button,
  ButtonVariants,
  bindStyles,
  formatNumber,
  Icon,
  Table,
  TableColumnType,
} from '@devbonnysid/ui-kit-default';
import { AssetCell, useGetUserAssets } from '@entities/assets';
import { DeleteUserAssetModal } from '@features/delete-user-asset';
import { UserAssetDtoShape } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { PageTitle, PageWrapper } from '@shared/ui';
import { AmountText, AmountTextTypes } from '@shared/ui/AmountText';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { EmptyUserAssets } from '../EmptyUserAssets';
import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { data, isLoading, isFetching } = useGetUserAssets();
  const isEmpty = data?.totalItems === 0;
  const { t } = useTranslation();
  const [userAssetToDelete, setUserAssetToDelete] = useState<UserAssetDtoShape | null>(null);
  const navigate = useNavigate();

  const columns = useMemo<TableColumnType<UserAssetDtoShape>[]>(() => {
    return [
      {
        key: 'asset',
        title: t('Asset'),
        render: (asset) => <AssetCell asset={asset} />,
      },
      {
        key: 'custom-column-price',
        title: t('Price'),
        render: (_, { asset }) => (
          <AmountText amount={asset.cachedMarketPrice} currency={asset.currencyCode} />
        ),
      },
      {
        key: 'avgBuyPrice',
        title: t('AvgBuyPrice'),
        render: (avgBuyPrice, { currencyCode }) => (
          <AmountText amount={avgBuyPrice} currency={currencyCode} />
        ),
      },
      {
        key: 'quantity',
        title: t('Quantity'),
        render: (quantity) => formatNumber(quantity, 0),
      },
      {
        key: 'costBasis',
        title: t('CostBasis'),
        render: (value, { currencyCode }) => <AmountText amount={value} currency={currencyCode} />,
      },
      {
        key: 'cost',
        title: t('TotalCost'),
        render: (value, { currencyCode }) => <AmountText amount={value} currency={currencyCode} />,
      },
      {
        key: 'unrealizedPnl',
        title: t('UnrealizedPnL'),
        render: (unrealizedPnl, { currencyCode }) => {
          const numUnrealizedPnl = Number(unrealizedPnl);
          const type =
            numUnrealizedPnl > 0
              ? AmountTextTypes.POSITIVE
              : numUnrealizedPnl === 0
                ? AmountTextTypes.DEFAULT
                : AmountTextTypes.NEGATIVE;

          return <AmountText amount={unrealizedPnl} currency={currencyCode} type={type} />;
        },
      },
      {
        key: 'realizedPnl',
        title: t('RealizedPnL'),
        render: (realizedPnl, { currencyCode }) => {
          const numRealizedPnl = Number(realizedPnl);
          const type =
            numRealizedPnl > 0
              ? AmountTextTypes.POSITIVE
              : numRealizedPnl === 0
                ? AmountTextTypes.DEFAULT
                : AmountTextTypes.NEGATIVE;

          return <AmountText amount={realizedPnl} currency={currencyCode} type={type} />;
        },
      },
      {
        key: 'custom-column-delete',
        title: '',
        width: 'max-content',
        render: (_, record) => {
          return (
            <Button
              variant={ButtonVariants.QUATERNARY}
              prefix={<Icon type="delete-alt" />}
              onClick={(e) => {
                e.stopPropagation();
                setUserAssetToDelete(record);
              }}
            />
          );
        },
      },
    ];
  }, [t]);

  const rowKey = useCallback((userAsset: UserAssetDtoShape) => {
    return userAsset.id;
  }, []);

  const onCloseDeleteModal = () => {
    setUserAssetToDelete(null);
  };

  const handleRowClick = (record: UserAssetDtoShape) => {
    navigate(AppRoutePaths.ASSETS_DETAILS({ symbol: record.asset.symbol }));
  };

  return (
    <PageWrapper className={cx('user-assets-page')}>
      <PageTitle>{t('MyAssets')}</PageTitle>

      <Table
        columns={columns}
        rowKey={rowKey}
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={isEmpty}
        onRowClick={handleRowClick}
        emptyPlug={<EmptyUserAssets />}
      />

      {userAssetToDelete && (
        <DeleteUserAssetModal
          symbol={userAssetToDelete.asset.symbol}
          userAsserId={userAssetToDelete.id}
          onClose={onCloseDeleteModal}
        />
      )}
    </PageWrapper>
  );
};

export default UserAssetsPage;
