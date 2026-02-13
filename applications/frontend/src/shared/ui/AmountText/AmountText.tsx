import { bindStyles, formatNumber, isUndefinedOrNull } from '@devbonnysid/ui-kit-default';
import { CurrencyCode, NumberString } from '@packages/types';
import { useCurrency } from '@shared/model';
import { getCurrencySymbol } from '@shared/utils';
import { FC } from 'react';

import styles from './AmountText.module.scss';

export enum AmountTextTypes {
  DEFAULT = 'default',

  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

type AmountTextProps = {
  amount?: number | NumberString;
  currency?: CurrencyCode;
  type?: AmountTextTypes;
};

const cx = bindStyles(styles);

export const AmountText: FC<AmountTextProps> = ({
  amount,
  currency,
  type = AmountTextTypes.DEFAULT,
}) => {
  const { currency: appCurrency } = useCurrency();

  const currentCurrency = currency ?? appCurrency;
  const hasAmount = !isUndefinedOrNull(amount);
  const hasCurrency = !isUndefinedOrNull(currentCurrency);

  if (!hasAmount && !hasCurrency) {
    return null;
  }

  return (
    <div className={cx('amount-text', type)}>
      {hasAmount && <span className={cx('amount')}>{formatNumber(amount)}</span>}
      {hasCurrency && <span className={cx('currency')}>{getCurrencySymbol(currentCurrency)}</span>}
    </div>
  );
};
