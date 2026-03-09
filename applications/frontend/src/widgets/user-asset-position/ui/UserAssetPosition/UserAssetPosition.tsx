import { bindStyles, formatNumber } from '@devbonnysid/ui-kit-default';
import { useGetUserAsset } from '@entities/assets';
import { AmountText, Block, RowInfo } from '@shared/ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UserAssetPosition.module.scss';

type UserAssetPositionProps = {
  symbol: string;
};

const cx = bindStyles(styles);

export const UserAssetPosition: FC<UserAssetPositionProps> = ({ symbol }) => {
  const { isLoading, data } = useGetUserAsset(symbol);
  const { t } = useTranslation();

  return (
    <Block className={cx('user-asset-position')} title={t('MyPosition')}>
      <RowInfo caption={t('Quantity')}>{formatNumber(data?.quantity || 0)}</RowInfo>
      <RowInfo caption={t('AvgBuyPrice')}>
        <AmountText amount={data?.avgBuyPrice} currency={data?.currencyCode} />
      </RowInfo>
    </Block>
  );
};
