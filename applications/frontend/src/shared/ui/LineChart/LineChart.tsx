import { bindStyles, formatNumber, useTheme } from '@devbonnysid/ui-kit-default';
import { getCssVariable } from '@shared/utils';
import {
  AreaSeries,
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  Time,
} from 'lightweight-charts';
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './LineChart.module.scss';

export type LineChartDataPoint = {
  time: Date;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export type LineChartProps = {
  data: LineChartDataPoint[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => undefined | Promise<unknown>;
};

const cx = bindStyles(styles);

type LineTooltip = {
  x: number;
  y: number;
  time: string;
  value: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

export const LineChart: FC<LineChartProps> = ({
  data,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dataByTimeRef = useRef(new Map<string, LineChartDataPoint>());
  const [tooltip, setTooltip] = useState<LineTooltip | null>(null);

  const chartApiRef = useRef<IChartApi>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Area'>>(null);
  const didSetInitialRangeRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    isLoadingMoreRef.current = isLoadingMore;
    onLoadMoreRef.current = onLoadMore;
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: getCssVariable('--color-bg-secondary') },
        textColor: getCssVariable('--color-text-primary'),
      },
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
    didSetInitialRangeRef.current = false;

    const handleVisibleRangeChange = (logicalRange: { from: number; to: number } | null) => {
      if (!logicalRange || logicalRange.from > 50) return;
      if (!hasMoreRef.current || isLoadingMoreRef.current) return;

      isLoadingMoreRef.current = true;
      onLoadMoreRef.current?.();
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const point = param.point;

      if (!point || !param.time) {
        setTooltip(null);
        return;
      }

      const lineData = param.seriesData.get(lineSeries) as
        | { value: number; time: string }
        | undefined;

      if (!lineData) {
        setTooltip(null);
        return;
      }

      const sourceData = dataByTimeRef.current.get(lineData.time);
      const container = chartContainerRef.current;
      const tooltipWidth = 180;
      const tooltipHeight = sourceData?.open === undefined ? 88 : 168;
      const left = Math.max(
        8,
        Math.min(point.x + 12, (container?.clientWidth ?? 0) - tooltipWidth - 8),
      );
      const nextTop =
        point.y + tooltipHeight + 16 > (container?.clientHeight ?? 0)
          ? point.y - tooltipHeight - 12
          : point.y + 12;
      const top = Math.max(8, nextTop);

      setTooltip({
        x: left,
        y: top,
        time: new Intl.DateTimeFormat(i18n.language).format(new Date(lineData.time)),
        value: lineData.value,
        open: sourceData?.open,
        high: sourceData?.high,
        low: sourceData?.low,
        close: sourceData?.close,
        volume: sourceData?.volume,
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
    };
  }, [i18n.language, theme]);

  useEffect(() => {
    if (lineSeriesRef.current && data.length > 0) {
      const sortedData = data
        .toSorted((a, b) => a.time.getTime() - b.time.getTime())
        .map((it) => ({
          ...it,
          time: it.time.toISOString().split('T')[0],
        }));

      // @ts-expect-error
      dataByTimeRef.current = new Map(sortedData.map((it) => [it.time, it]));
      lineSeriesRef.current.setData(sortedData);

      if (sortedData.length > 0 && !didSetInitialRangeRef.current) {
        const lastDataPoint = sortedData[sortedData.length - 1];
        const lastDate = new Date(lastDataPoint.time);
        const oneMonthAgo = new Date(lastDate);
        oneMonthAgo.setMonth(lastDate.getMonth() - 3);

        chartApiRef.current?.timeScale().setVisibleRange({
          from: oneMonthAgo.toISOString().split('T')[0],
          to: lastDate.toISOString().split('T')[0],
        });
        didSetInitialRangeRef.current = true;
      }
    }
  }, [data, i18n.language, theme]);

  return (
    <div ref={chartContainerRef} className={cx('line-chart')}>
      {tooltip && (
        <div className={cx('tooltip')} style={{ left: tooltip.x, top: tooltip.y }}>
          <div className={cx('tooltip-date')}>{tooltip.time}</div>
          {tooltip.open === undefined ? (
            <div className={cx('tooltip-row')}>
              <span>Value</span>
              <strong>{formatNumber(tooltip.value)}</strong>
            </div>
          ) : (
            <>
              <div className={cx('tooltip-row')}>
                <span>Open</span>
                <strong>{formatNumber(tooltip.open)}</strong>
              </div>
              <div className={cx('tooltip-row')}>
                <span>High</span>
                <strong>{formatNumber(tooltip.high ?? 0)}</strong>
              </div>
              <div className={cx('tooltip-row')}>
                <span>Low</span>
                <strong>{formatNumber(tooltip.low ?? 0)}</strong>
              </div>
              <div className={cx('tooltip-row')}>
                <span>Close</span>
                <strong>{formatNumber(tooltip.close ?? tooltip.value)}</strong>
              </div>
              <div className={cx('tooltip-row')}>
                <span>Volume</span>
                <strong>{formatNumber(tooltip.volume ?? 0, 0)}</strong>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
