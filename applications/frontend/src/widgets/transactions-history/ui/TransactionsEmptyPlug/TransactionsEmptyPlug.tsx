import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './TransactionsEmptyPlug.module.scss';

const cn = bindStyles(styles);

export const TransactionsEmptyPlug: FC = () => {
  const { t } = useTranslation();

  return (
    <div className={cn('plug')}>
      <div className={cn('icon-wrap')}>
        {/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="12"
            y="8"
            width="40"
            height="48"
            rx="5"
            fill="var(--color-bg-secondary)"
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
          />
          <path
            d="M20 20h12"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          <path
            d="M20 28h20"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
          <path
            d="M20 36h16"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.25"
          />
          <circle
            cx="48"
            cy="48"
            r="10"
            fill="var(--color-bg-primary)"
            stroke="var(--color-border-primary)"
            strokeWidth="1.5"
          />
          <path
            d="M48 44v8M44 48h8"
            stroke="var(--color-text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

      <div className={cn('text-block')}>
        <p className={cn('title')}>{t('transactions.empty_title')}</p>
        <p className={cn('subtitle')}>{t('transactions.empty_subtitle')}</p>
      </div>

      <div className={cn('badges')}>
        <span className={cn('badge', 'buy')}>{t('operationType.BUY')}</span>
        <span className={cn('badge', 'sell')}>{t('operationType.SELL')}</span>
        <span className={cn('badge', 'transfer')}>{t('operationType.TRANSFER_OUT')}</span>
      </div>
    </div>
  );
};
