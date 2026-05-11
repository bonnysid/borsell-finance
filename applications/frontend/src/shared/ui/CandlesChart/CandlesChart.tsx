import { bindStyles, formatNumber, useTheme } from '@devbonnysid/ui-kit-default';
import { getCssVariable } from '@shared/utils';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
} from 'lightweight-charts';
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './CandlesChart.module.scss';

export type ChartDataCandle = {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type CandlesChartProps = {
  data: ChartDataCandle[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => undefined | Promise<unknown>;
};

const cx = bindStyles(styles);

type CandlesTooltip = {
  x: number;
  y: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const CandlesChart: FC<CandlesChartProps> = ({
  data,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<CandlesTooltip | null>(null);

  // Используем Ref для хранения инстансов, чтобы не пересоздавать их
  const chartApiRef = useRef<IChartApi>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'>>(null);
  const didSetInitialRangeRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    isLoadingMoreRef.current = isLoadingMore;
    onLoadMoreRef.current = onLoadMore;
  }, [hasMore, isLoadingMore, onLoadMore]);

  // 1. Инициализация графика (только при первом рендере)
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: getCssVariable('--color-bg-secondary') },
        textColor: getCssVariable('--color-text-primary'),
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      grid: {
        vertLines: { color: getCssVariable('--color-border-primary') },
        horzLines: { color: getCssVariable('--color-border-primary') },
      },
      localization: {
        locale: i18n.language,
      },
    });

    // Создаем серии один раз
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: getCssVariable('--color-success-secondary'),
      downColor: getCssVariable('--color-error-secondary'),
      borderVisible: false,
      wickUpColor: getCssVariable('--color-success-secondary'),
      wickDownColor: getCssVariable('--color-error-secondary'),
    });

    candleSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1, // Оставляем 10% сверху
        bottom: 0.3, // Оставляем 30% снизу для объема
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: getCssVariable('--color-success-secondary'),
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume', // Используем отдельную шкалу для объема
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Начинаем с 80% высоты (чтобы не перекрывать свечи)
        bottom: 0,
      },
    });

    // Сохраняем ссылки в refs
    chartApiRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    didSetInitialRangeRef.current = false;

    const handleVisibleRangeChange = (logicalRange: { from: number; to: number } | null) => {
      if (!logicalRange || logicalRange.from > 50) return;
      if (!hasMoreRef.current || isLoadingMoreRef.current) return;

      isLoadingMoreRef.current = true;
      onLoadMoreRef.current?.();
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    const handleCrosshairMove = (param: MouseEventParams) => {
      const point = param.point;

      if (!point || !param.time) {
        setTooltip(null);
        return;
      }

      const candleData = param.seriesData.get(candleSeries) as
        | { open: number; high: number; low: number; close: number; time: string }
        | undefined;
      const volumeData = param.seriesData.get(volumeSeries) as { value?: number } | undefined;

      if (!candleData) {
        setTooltip(null);
        return;
      }

      const container = chartContainerRef.current;
      const tooltipWidth = 180;
      const tooltipHeight = 168;
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
        time: new Intl.DateTimeFormat(i18n.language).format(new Date(candleData.time)),
        open: candleData.open,
        high: candleData.high,
        low: candleData.low,
        close: candleData.close,
        volume: volumeData?.value ?? 0,
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Ресайз через ResizeObserver (более современно, чем window.resize)
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [i18n.language, theme]);

  // 2. Обновление только данных (при изменении пропса data или смене языка)
  useEffect(() => {
    if (candleSeriesRef.current && volumeSeriesRef.current && data.length > 0) {
      // Сортируем данные по времени (критично для Lightweight Charts)
      const sortedData = data
        .toSorted((a, b) => a.time.getTime() - b.time.getTime())
        .map((it) => ({
          ...it,
          time: it.time.toISOString().split('T')[0],
        }));

      candleSeriesRef.current.setData(sortedData);

      const volumeData = sortedData.map((d) => ({
        time: d.time,
        value: d.volume ?? 0,
        color:
          d.close >= d.open
            ? getCssVariable('--color-success-secondary')
            : getCssVariable('--color-error-secondary'),
      }));

      volumeSeriesRef.current.setData(volumeData);

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
    <div ref={chartContainerRef} className={cx('candles-chart')}>
      {tooltip && (
        <div className={cx('tooltip')} style={{ left: tooltip.x, top: tooltip.y }}>
          <div className={cx('tooltip-date')}>{tooltip.time}</div>
          <div className={cx('tooltip-row')}>
            <span>Open</span>
            <strong>{formatNumber(tooltip.open)}</strong>
          </div>
          <div className={cx('tooltip-row')}>
            <span>High</span>
            <strong>{formatNumber(tooltip.high)}</strong>
          </div>
          <div className={cx('tooltip-row')}>
            <span>Low</span>
            <strong>{formatNumber(tooltip.low)}</strong>
          </div>
          <div className={cx('tooltip-row')}>
            <span>Close</span>
            <strong>{formatNumber(tooltip.close)}</strong>
          </div>
          <div className={cx('tooltip-row')}>
            <span>Volume</span>
            <strong>{formatNumber(tooltip.volume, 0)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
