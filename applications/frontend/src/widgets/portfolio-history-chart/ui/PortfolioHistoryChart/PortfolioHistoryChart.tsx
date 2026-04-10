import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioHistory } from '@entities/portfolio';
import { Block, LineChart, LineChartDataPoint } from '@shared/ui';
import { FC, useMemo } from 'react';

import styles from './PortfolioHistoryChart.module.scss';

const cx = bindStyles(styles);

export const PortfolioHistoryChart: FC = () => {
  const { data, isLoading } = useGetPortfolioHistory();

  const chartData = useMemo<LineChartDataPoint[]>(() => {
    if (!data?.items) return [];

    return data.items.map((item) => ({
      value: Number(item.marketPrice),
      time: new Date(item.createdAt),
    }));
  }, [data]);

  return (
    <Block
      className={cx('portfolio-history-chart')}
      title={data ? `История портфеля (${data.currencyCode})` : 'История портфеля'}
      isLoading={isLoading}
    >
      {data && data.items.length > 0 && <LineChart data={chartData} />}
    </Block>
  );
};
