import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetAssetCandles } from '@entities/assets';
import { CandlesChart, ChartDataCandle } from '@shared/ui';
import { FC, useMemo } from 'react';

import styles from './LineChartAssetPriceHistory.module.scss';

type LineChartAssetPriceHistoryProps = {
  symbol: string;
};

const cx = bindStyles(styles);

export const LineChartAssetPriceHistory: FC<LineChartAssetPriceHistoryProps> = ({ symbol }) => {
  const { data } = useGetAssetCandles(symbol);

  const chartData = useMemo<ChartDataCandle[]>(() => {
    return (data ?? []).map(
      (it) =>
        ({
          close: Number(it.closePrice),
          time: new Date(it.date),
          low: Number(it.lowPrice),
          high: Number(it.highPrice),
          volume: Number(it.volume),
          open: Number(it.openPrice),
        }) satisfies ChartDataCandle,
    );
  }, [data]);

  return (
    <div className={cx('line-chart-asset-price-history')}>
      <CandlesChart data={chartData} />
    </div>
  );
};
