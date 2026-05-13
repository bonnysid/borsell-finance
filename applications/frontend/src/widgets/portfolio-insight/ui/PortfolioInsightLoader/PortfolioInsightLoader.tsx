import { bindStyles, Skeleton } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './PortfolioInsightLoader.module.scss';

type PortfolioInsightLoaderProps = {
  message: string;
  hint: string;
};

const cx = bindStyles(styles);

export const PortfolioInsightLoader: FC<PortfolioInsightLoaderProps> = ({ message, hint }) => (
  <div className={cx('loader')}>
    <div className={cx('header')}>
      <div className={cx('header-left')}>
        <Skeleton width={70} height={24} borderRadius="5px" />
        <Skeleton width="55%" height={20} borderRadius="4px" />
      </div>
      <Skeleton width={52} height={44} borderRadius="var(--RoundingS)" />
    </div>
    <Skeleton width="100%" height={62} borderRadius="var(--RoundingS)" />
    <div className={cx('metrics')}>
      <Skeleton width="100%" height={62} borderRadius="var(--RoundingS)" />
      <Skeleton width="100%" height={62} borderRadius="var(--RoundingS)" />
      <Skeleton width="100%" height={62} borderRadius="var(--RoundingS)" />
      <Skeleton width="100%" height={62} borderRadius="var(--RoundingS)" />
    </div>
    <div className={cx('recs')}>
      <Skeleton width="80%" height={14} borderRadius="4px" />
      <Skeleton width="65%" height={14} borderRadius="4px" />
    </div>
    <div className={cx('status')}>
      <span className={cx('dot')} />
      <span className={cx('message')}>{message}</span>
      <span className={cx('hint')}>{hint}</span>
    </div>
  </div>
);
