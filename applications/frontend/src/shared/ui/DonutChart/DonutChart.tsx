import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import styles from './DonutChart.module.scss';

const cx = bindStyles(styles);

export type DonutChartDataItem = {
  id?: string | number;
  name: string;
  value: number;
  color?: string;
};

export type DonutChartProps = {
  data: DonutChartDataItem[];
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
  className?: string;
};

const DEFAULT_COLORS = [
  '#3366FF', // info
  '#00C48C', // success
  '#FF4842', // error
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
];

export const DonutChart: FC<DonutChartProps> = ({
  data,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 80,
  height = 200,
  className,
}) => {
  const [hiddenIds, setHiddenIds] = useState<Set<string | number>>(new Set());

  const legendData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: item.color || colors[index % colors.length],
        isHidden: hiddenIds.has(item.id ?? index),
      })),
    [data, colors, hiddenIds],
  );

  const chartData = useMemo(
    () => legendData.filter((item) => item.value > 0 && !item.isHidden),
    [legendData],
  );

  const toggleItem = (id: string | number) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (data.length === 0) {
    return <div className={cx('donut-chart-empty', className)}>No data</div>;
  }

  return (
    <div className={cx('donut-chart-container', className)}>
      <div className={cx('donut-chart-wrapper')} style={{ height }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={0}
                minAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.id || index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className={cx('donut-chart-empty')}>No active data</div>
        )}
      </div>

      <div className={cx('donut-chart-labels')}>
        {legendData.map((item, index) => (
          <div
            key={`label-${item.id || index}`}
            className={cx('donut-chart-label', { 'is-hidden': item.isHidden })}
            onClick={() => toggleItem(item.id ?? index)}
          >
            <span
              className={cx('donut-chart-label-color')}
              style={{ backgroundColor: item.color }}
            />
            <span className={cx('donut-chart-label-name')}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
