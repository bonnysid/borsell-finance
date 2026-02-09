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
import { ID, UserAssetDtoShape } from '@packages/types';
import { PageTitle, PageWrapper } from '@shared/ui';
import { AmountText } from '@shared/ui/AmountText';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyUserAssets } from '../EmptyUserAssets';
import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { data, isLoading, isFetching } = useGetUserAssets();
  const isEmpty = data?.totalItems === 0;
  const { t } = useTranslation();
  const [userAssetIdToDelete, setUserAssetIdToDelete] = useState<ID | null>(null);

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
        key: 'unrealizedPnl',
        title: t('UnrealizedPnL'),
        render: (unrealizedPnl, { currencyCode }) => (
          <AmountText amount={unrealizedPnl} currency={currencyCode} />
        ),
      },
      {
        key: 'realizedPnl',
        title: t('RealizedPnL'),
        render: (realizedPnl, { currencyCode }) => (
          <AmountText amount={realizedPnl} currency={currencyCode} />
        ),
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
              onClick={() => setUserAssetIdToDelete(record.id)}
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
    setUserAssetIdToDelete(null);
  };

  return (
    <PageWrapper className={cx('user-assets-page')}>
      <PageTitle>{t('Assets')}</PageTitle>

      <Table
        columns={columns}
        rowKey={rowKey}
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={isEmpty}
        emptyPlug={<EmptyUserAssets />}
      />

      {userAssetIdToDelete && (
        <DeleteUserAssetModal userAsserId={userAssetIdToDelete} onClose={onCloseDeleteModal} />
      )}
    </PageWrapper>
  );
};

export default UserAssetsPage;
