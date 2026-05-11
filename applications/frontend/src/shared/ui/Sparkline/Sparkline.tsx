import { bindStyles, useTheme } from '@devbonnysid/ui-kit-default';
import { getCssVariable } from '@shared/utils';
import { AreaSeries, ColorType, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { FC, useEffect, useRef } from 'react';

import styles from './Sparkline.module.scss';

export type SparklineDataPoint = {
  time: Date;
  value: number;
};

export type SparklineProps = {
  data: SparklineDataPoint[];
  width?: number;
  height?: number;
};

const cx = bindStyles(styles);

export const Sparkline: FC<SparklineProps> = ({ data, width = 120, height = 40 }) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartApiRef = useRef<IChartApi>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Area'>>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      width,
      height,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      leftPriceScale: { visible: false },
      rightPriceScale: { visible: false, borderVisible: false },
      timeScale: { visible: false, borderVisible: false },
      handleScroll: false,
      handleScale: false,
    });

    const isUp = data.length > 1 ? data[data.length - 1].value >= data[0].value : true;
    const color = isUp
      ? getCssVariable('--color-success-secondary')
      : getCssVariable('--color-error-secondary');

    const lineSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}33`, // 20% opacity
      bottomColor: `${color}00`, // 0% opacity
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartApiRef.current = chart;
    lineSeriesRef.current = lineSeries;

    return () => {
      chart.remove();
    };
  }, [width, height, data, theme]);

  useEffect(() => {
    if (lineSeriesRef.current && data.length > 0) {
      lineSeriesRef.current.setData(
        data.map((it) => ({
          ...it,
          time: it.time.toISOString().split('T')[0],
        })),
      );
      chartApiRef.current?.timeScale().fitContent();
    }
  }, [data, theme]);

  return <div ref={chartContainerRef} className={cx('sparkline')} />;
};
