import { bindStyles, formatNumber } from '@devbonnysid/ui-kit-default';
import { AssetPriceDtoShape } from '@packages/types';
import { AmountText, AmountTextTypes } from '@shared/ui';
import { FC, useMemo } from 'react';

import styles from './AssetPrice.module.scss';

type AssetPriceProps = {
  assetPrice: AssetPriceDtoShape;
};

const cx = bindStyles(styles);

export const AssetPrice: FC<AssetPriceProps> = ({ assetPrice }) => {
  const amountType = useMemo(() => {
    if (Math.sign(Number(assetPrice.change)) === -1) {
      return AmountTextTypes.NEGATIVE;
    }

    return AmountTextTypes.POSITIVE;
  }, [assetPrice.change]);

  const changeSign = useMemo(() => {
    const sign = Math.sign(Number(assetPrice.change));

    if (sign === 1) {
      return '+';
    }

    return '';
  }, [assetPrice.change]);

  return (
    <div className={cx('asset-price')}>
      <AmountText
        amount={assetPrice.currentPrice}
        currency={assetPrice.currencyCode}
        type={amountType}
      />
      <div className={cx('badge', amountType.toLowerCase())}>
        {changeSign}
        {formatNumber(assetPrice.change)} ({assetPrice.changePercent}%)
      </div>
    </div>
  );
};
