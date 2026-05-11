import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioInsight, useRefreshPortfolioInsight } from '@entities/portfolio';
import { Block } from '@shared/ui';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PortfolioInsight.module.scss';

type PortfolioInsightProps = {
  compact?: boolean;
};

const cx = bindStyles(styles);

export const usePortfolioInsights = () => {
  const { data: insight, isLoading } = useGetPortfolioInsight();
  const { t } = useTranslation();

  return useMemo(() => {
    if (!insight) {
      return { hasData: false, title: '', summary: '', recommendations: [], status: 'average', isLoading };
    }

    return {
      hasData: true,
      title: t(insight.titleKey as any),
      summary: t(insight.summaryKey as any),
      recommendations: insight.recommendations.map((r) => t(r.key as any, r.params)),
      status: insight.status,
      isLoading,
    };
  }, [insight, isLoading, t]);
};

export const PortfolioInsight: FC<PortfolioInsightProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { data: insight, isLoading } = useGetPortfolioInsight();
  const refresh = useRefreshPortfolioInsight();

  return (
    <Block
      title={t('portfolio.insight.block_title')}
      className={cx('portfolio-insight', insight?.status, compact && 'compact')}
      isLoading={isLoading}
    >
      <div className={cx('header')}>
        <div>
          {insight && (
            <div className={cx('status')}>
              {t(`portfolio.insight.status_label.${insight.status}`)}
            </div>
          )}
          <div className={cx('title')}>{insight && t(insight.titleKey as any)}</div>
        </div>
        <div className={cx('header-right')}>
          <div className={cx('score')}>
            <span>{insight?.score}</span>
            <small>/100</small>
          </div>
          {!compact && (
            <button
              type="button"
              className={cx('refresh-btn')}
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
              title={t('portfolio.insight.refresh')}
            >
              {refresh.isPending ? '…' : '↻'}
            </button>
          )}
        </div>
      </div>

      {insight?.aiSummary ? (
        <p className={cx('ai-summary')}>{insight.aiSummary}</p>
      ) : (
        <p className={cx('summary')}>{insight && t(insight.summaryKey as any)}</p>
      )}

      {!compact && (
        <div className={cx('metrics')}>
          {insight?.metrics.map((metric) => (
            <div key={metric.labelKey} className={cx('metric', metric.tone)}>
              <span>{t(metric.labelKey as any)}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      )}

      <ul className={cx('recommendations')}>
        {insight?.recommendations.slice(0, compact ? 2 : 4).map((recommendation) => (
          <li key={recommendation.key}>{t(recommendation.key, recommendation.params as any)}</li>
        ))}
      </ul>
    </Block>
  );
};
