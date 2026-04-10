import { bindStyles } from '@devbonnysid/ui-kit-default';
import { getCssVariable } from '@shared/utils';
import { AreaSeries, ColorType, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './LineChart.module.scss';

export type LineChartDataPoint = {
  time: Date;
  value: number;
};

export type LineChartProps = {
  data: LineChartDataPoint[];
};

const cx = bindStyles(styles);

export const LineChart: FC<LineChartProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartApiRef = useRef<IChartApi>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Area'>>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: getCssVariable('--color-bg-secondary') },
        textColor: getCssVariable('--color-text-primary'),
      },
      width: container.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: getCssVariable('--color-border-primary') },
        horzLines: { color: getCssVariable('--color-border-primary') },
      },
      localization: {
        locale: i18n.language,
      },
    });

    const lineSeries = chart.addSeries(AreaSeries, {
      lineColor: getCssVariable('--color-info-secondary'),
      topColor: getCssVariable('--color-info-secondary'),
      bottomColor: 'rgba(33, 150, 243, 0.05)',
      lineWidth: 2,
    });

    chartApiRef.current = chart;
    lineSeriesRef.current = lineSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [i18n.language]);

  useEffect(() => {
    if (lineSeriesRef.current && data.length > 0) {
      const sortedData = data
        .toSorted((a, b) => a.time.getTime() - b.time.getTime())
        .map((it) => ({
          ...it,
          time: it.time.toISOString().split('T')[0],
        }));

      lineSeriesRef.current.setData(sortedData);

      // Устанавливаем видимый диапазон на последний месяц
      if (sortedData.length > 0) {
        const lastDataPoint = sortedData[sortedData.length - 1];
        const lastDate = new Date(lastDataPoint.time);
        const oneMonthAgo = new Date(lastDate);
        oneMonthAgo.setMonth(lastDate.getMonth() - 3);

        chartApiRef.current?.timeScale().setVisibleRange({
          from: oneMonthAgo.toISOString().split('T')[0],
          to: lastDate.toISOString().split('T')[0],
        });
      }
    }
  }, [data, i18n.language]);

  return <div ref={chartContainerRef} className={cx('line-chart')} />;
};
