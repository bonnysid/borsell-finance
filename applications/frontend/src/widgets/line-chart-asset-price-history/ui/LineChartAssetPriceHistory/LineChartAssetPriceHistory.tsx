import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetAssetPriceHistory } from '@entities/assets';
import { FC } from 'react';

import styles from './LineChartAssetPriceHistory.module.scss';

type LineChartAssetPriceHistoryProps = {
  symbol: string;
};

const cx = bindStyles(styles);

export const LineChartAssetPriceHistory: FC<LineChartAssetPriceHistoryProps> = ({ symbol }) => {
  const { data } = useGetAssetPriceHistory(symbol);

  return <div className={cx('line-chart-asset-price-history')}>line chart</div>;
};
