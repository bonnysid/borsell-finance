import { bindStyles, formatNumber, isUndefinedOrNull } from '@devbonnysid/ui-kit-default';
import { CurrencyCode, NumberString } from '@packages/types';
import { useCurrency } from '@shared/model';
import { FC } from 'react';

import styles from './AmountText.module.scss';

type AmountTextProps = {
  amount?: number | NumberString;
  currency?: CurrencyCode;
};

const cx = bindStyles(styles);

export const AmountText: FC<AmountTextProps> = ({ amount, currency }) => {
  const { currency: appCurrency } = useCurrency();

  const currentCurrency = currency ?? appCurrency;
  const hasAmount = !isUndefinedOrNull(amount);
  const hasCurrency = !isUndefinedOrNull(currentCurrency);

  if (!hasAmount && !hasCurrency) {
    return null;
  }

  return (
    <div className={cx('amount-text')}>
      {hasAmount && <span className={cx('amount')}>{formatNumber(amount)}</span>}
      {hasCurrency && <span className={cx('currency')}>{currentCurrency}</span>}
    </div>
  );
};
