import { bindStyles, TabList, TabType } from '@devbonnysid/ui-kit-default';
import { useGetAssetCandles } from '@entities/assets';
import { CandlesChart, ChartDataCandle, LineChart, LineChartDataPoint } from '@shared/ui';
import { FC, useMemo, useState } from 'react';

import styles from './ChartAssetPriceHistory.module.scss';

export enum ChartVariants {
  CANDLES = 'candles',
  LINE = 'line',
}

type ChartAssetPriceHistoryProps = {
  symbol: string;
};

const cx = bindStyles(styles);

export const ChartAssetPriceHistory: FC<ChartAssetPriceHistoryProps> = ({ symbol }) => {
  const { data } = useGetAssetCandles(symbol);
  const [selectedChartVariant, setSelectedChartVariant] = useState(ChartVariants.CANDLES);

  const candlesData = useMemo<ChartDataCandle[]>(() => {
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

  const lineData = useMemo<LineChartDataPoint[]>(() => {
    return (data ?? []).map(
      (it) =>
        ({
          value: Number(it.closePrice),
          time: new Date(it.date),
        }) satisfies LineChartDataPoint,
    );
  }, [data]);

  const tabs = useMemo<TabType<ChartVariants>[]>(() => {
    return [
      {
        prefix: 'line-chart',
        value: ChartVariants.LINE,
      },
      {
        prefix: 'bar-chart',
        value: ChartVariants.CANDLES,
      },
    ];
  }, []);

  return (
    <div className={cx('chart-asset-price-history')}>
      <div className={cx('header')}>
        <TabList tabs={tabs} value={selectedChartVariant} onChange={setSelectedChartVariant} />
      </div>

      {selectedChartVariant === ChartVariants.CANDLES && <CandlesChart data={candlesData} />}

      {selectedChartVariant === ChartVariants.LINE && <LineChart data={lineData} />}
    </div>
  );
};
