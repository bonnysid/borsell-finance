import { bindStyles, formatNumber } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioSummary } from '@entities/portfolio';
import { AmountText, AmountTextTypes, Block, PercentText } from '@shared/ui';
import { getCurrencySymbol } from '@shared/utils';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PortfolioSummary.module.scss';

type PortfolioSummaryProps = {};

const cx = bindStyles(styles);

export const PortfolioSummary: FC<PortfolioSummaryProps> = ({}) => {
  const { t } = useTranslation();
  const { data: portfolio, isLoading } = useGetPortfolioSummary();

  const { totalPnl, totalPnlPercent, pnlToday, pnlTodayPercent } = useMemo(() => {
    if (!portfolio) {
      return { totalPnl: 0, totalPnlPercent: 0, pnlToday: 0, pnlTodayPercent: 0 };
    }

    const pnl = Number(portfolio.marketPrice) - Number(portfolio.costBasis);
    const pnlPercent = (pnl / Number(portfolio.costBasis)) * 100;

    return {
      totalPnl: pnl,
      totalPnlPercent: isNaN(pnlPercent) ? 0 : pnlPercent,
      pnlToday: Number(portfolio.pnlToday),
      pnlTodayPercent: portfolio.pnlTodayPercent,
    };
  }, [portfolio]);

  const balanceParts = useMemo(() => {
    if (!portfolio) return { integer: '0', decimal: '00' };

    const formatted = formatNumber(portfolio.marketPrice);

    const [integer, decimal] = formatted.split(/[.]/);
    return { integer, decimal };
  }, [portfolio]);

  if (isLoading) {
    return (
      <Block className={cx('portfolio-summary')}>
        <div className={cx('loading')}>{t('NoData')}...</div>
      </Block>
    );
  }

  if (!portfolio) {
    return (
      <Block className={cx('portfolio-summary')}>
        <div className={cx('no-data')}>{t('NoData')}</div>
      </Block>
    );
  }

  const pnlType =
    totalPnl > 0
      ? AmountTextTypes.POSITIVE
      : totalPnl < 0
        ? AmountTextTypes.NEGATIVE
        : AmountTextTypes.DEFAULT;

  const pnlTodayType =
    pnlToday > 0
      ? AmountTextTypes.POSITIVE
      : pnlToday < 0
        ? AmountTextTypes.NEGATIVE
        : AmountTextTypes.DEFAULT;

  return (
    <Block className={cx('portfolio-summary')}>
      <div className={cx('label')}>{t('Balance')}</div>

      <div className={cx('total-balance-container')}>
        <span className={cx('integer')}>{balanceParts.integer}</span>
        <span className={cx('decimal')}>.{balanceParts.decimal}</span>
        <span className={cx('currency-symbol')}>{getCurrencySymbol(portfolio.currencyCode)}</span>
      </div>

      <div className={cx('pnl-badges')}>
        <div className={cx('pnl-badge', pnlType)}>
          <AmountText amount={totalPnl} type={pnlType} currency={portfolio.currencyCode} />
          <div className={cx('pnl-percent-container')}>
            <span className={cx('arrow')}>{totalPnl >= 0 ? '↑' : '↓'}</span>
            <PercentText value={Math.abs(totalPnlPercent)} showPlus={false} />
          </div>
          <span className={cx('pnl-period')}>{t('AllTime')}</span>
        </div>

        {pnlToday !== 0 && (
          <div className={cx('pnl-badge', pnlTodayType)}>
            <AmountText amount={pnlToday} type={pnlTodayType} currency={portfolio.currencyCode} />
            <div className={cx('pnl-percent-container')}>
              <span className={cx('arrow')}>{pnlToday >= 0 ? '↑' : '↓'}</span>
              <PercentText value={Math.abs(pnlTodayPercent)} showPlus={false} />
            </div>
            <span className={cx('pnl-period')}>{t('Today')}</span>
          </div>
        )}
      </div>
    </Block>
  );
};
