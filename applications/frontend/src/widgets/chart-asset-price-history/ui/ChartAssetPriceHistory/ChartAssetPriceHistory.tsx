import { bindStyles, TabList, TabType } from '@devbonnysid/ui-kit-default';
import { useInfiniteAssetCandles } from '@entities/assets';
import { CandlesChart, ChartDataCandle, LineChart, LineChartDataPoint } from '@shared/ui';
import { FC, useCallback, useMemo, useState } from 'react';

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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteAssetCandles(symbol);
  const [selectedChartVariant, setSelectedChartVariant] = useState(ChartVariants.CANDLES);

  const history = useMemo(() => {
    const byDate = new Map<string, NonNullable<typeof data>['pages'][number][number]>();

    for (const item of data?.pages.flat() ?? []) {
      byDate.set(item.date, item);
    }

    return Array.from(byDate.values()).toSorted(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [data]);

  const candlesData = useMemo<ChartDataCandle[]>(() => {
    return history.map(
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
  }, [history]);

  const lineData = useMemo<LineChartDataPoint[]>(() => {
    return history.map(
      (it) =>
        ({
          value: Number(it.closePrice),
          time: new Date(it.date),
        }) satisfies LineChartDataPoint,
    );
  }, [history]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    return fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

      {selectedChartVariant === ChartVariants.CANDLES && (
        <CandlesChart
          data={candlesData}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      )}

      {selectedChartVariant === ChartVariants.LINE && (
        <LineChart
          data={lineData}
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
};
