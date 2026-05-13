import { bindStyles, Skeleton } from '@devbonnysid/ui-kit-default';
import { useGetAssetNewsAnalysis } from '@entities/assets';
import { Block } from '@shared/ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './AssetNewsSentiment.module.scss';

type AssetNewsSentimentProps = {
  symbol: string;
};

const cx = bindStyles(styles);

const SENTIMENT_LABEL_KEYS = {
  positive: 'asset.news_sentiment.positive',
  neutral: 'asset.news_sentiment.neutral',
  negative: 'asset.news_sentiment.negative',
} as const;

type Props = {
  message: string;
  hint: string;
};

const NewsAnalysisLoader: FC<Props> = ({ message, hint }) => (
  <div className={cx('loader')}>
    <div className={cx('loader-skeletons')}>
      <Skeleton width="40%" height={22} borderRadius="5px" />
      <Skeleton width="100%" height={80} borderRadius="var(--RoundingS)" />
      <Skeleton width="60%" height={14} borderRadius="4px" />
    </div>
    <div className={cx('loader-status')}>
      <span className={cx('loader-dot')} />
      <span className={cx('loader-message')}>{message}</span>
      <span className={cx('loader-hint')}>{hint}</span>
    </div>
  </div>
);

export const AssetNewsSentiment: FC<AssetNewsSentimentProps> = ({ symbol }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetAssetNewsAnalysis([symbol]);

  return (
    <Block
      title={t('asset.news_sentiment.title')}
      className={cx('asset-news-sentiment', data?.sentiment)}
      isLoading={isLoading}
      titleAlign="left"
      loadingContent={
        <NewsAnalysisLoader
          message={t('asset.news_sentiment.loading')}
          hint={t('asset.news_sentiment.loading_hint')}
        />
      }
    >
      {!data && !isLoading && <p className={cx('empty')}>{t('asset.news_sentiment.no_news')}</p>}

      {data && (
        <>
          <div className={cx('header')}>
            <span className={cx('badge')}>{t(SENTIMENT_LABEL_KEYS[data.sentiment])}</span>
            <span className={cx('meta')}>
              {t('asset.news_sentiment.based_on', { count: data.newsCount })}
            </span>
          </div>

          <p className={cx('analysis')}>{data.analysis}</p>

          <span className={cx('date')}>
            {t('asset.news_sentiment.analyzed_at', {
              date: new Date(data.analyzedAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
            {/*{data.cached && ` · ${t('asset.news_sentiment.cached')}`}*/}
          </span>
        </>
      )}
    </Block>
  );
};
