import { bindStyles, formatNumber } from '@devbonnysid/ui-kit-default';
import { NumberString } from '@packages/types';
import { AmountTextTypes } from '@shared/ui/AmountText';
import { FC, useMemo } from 'react';

import styles from './PercentText.module.scss';

type PercentTextProps = {
  value?: number | NumberString;
  showPlus?: boolean;
};

const cx = bindStyles(styles);

export const PercentText: FC<PercentTextProps> = ({ value, showPlus = true }) => {
  const numericValue = Number(value || 0);

  const type = useMemo(() => {
    if (numericValue > 0) return AmountTextTypes.POSITIVE;
    if (numericValue < 0) return AmountTextTypes.NEGATIVE;
    return AmountTextTypes.DEFAULT;
  }, [numericValue]);

  const sign = useMemo(() => {
    if (showPlus && numericValue > 0) return '+';
    return '';
  }, [showPlus, numericValue]);

  return (
    <div className={cx('percent-text', type)}>
      {sign}
      {formatNumber(numericValue)}%
    </div>
  );
};
