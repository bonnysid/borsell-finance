import { bindStyles } from '@devbonnysid/ui-kit-default';
import { getCssVariable } from '@shared/utils';
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { FC, useEffect, useRef } from 'react';
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
};

const cx = bindStyles(styles);

export const CandlesChart: FC<CandlesChartProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Используем Ref для хранения инстансов, чтобы не пересоздавать их
  const chartApiRef = useRef<IChartApi>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'>>(null);

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

    // Ресайз через ResizeObserver (более современно, чем window.resize)
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [i18n.language]); // Пересоздаем график при смене языка

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

  return <div ref={chartContainerRef} className={cx('candles-chart')} />;
};
