import { bindStyles, formatNumber, Tooltip } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioSummary } from '@entities/portfolio';
import { AmountText, AmountTextTypes, Block, DirectionArrow, PercentText } from '@shared/ui';
import { getCurrencySymbol } from '@shared/utils';
import { formatSum } from '@shared/utils/sum';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PortfolioSummary.module.scss';

const cx = bindStyles(styles);

export const PortfolioSummary: FC = () => {
  const { t } = useTranslation();
  const { data: portfolio, isLoading } = useGetPortfolioSummary();

  const { totalPnl, totalPnlPercent, pnlMonth, pnlMonthPercent } = useMemo(() => {
    if (!portfolio) {
      return { totalPnl: 0, totalPnlPercent: 0, pnlMonth: 0, pnlMonthPercent: 0 };
    }

    const pnl = Number(portfolio.marketPrice) - Number(portfolio.costBasis);
    const pnlPercent = (pnl / Number(portfolio.costBasis)) * 100;

    return {
      totalPnl: pnl,
      totalPnlPercent: Number.isNaN(pnlPercent) ? 0 : pnlPercent,
      pnlMonth: Math.abs(Number(portfolio.pnlMonth)) < 0.01 ? 0 : Number(portfolio.pnlMonth),
      pnlMonthPercent: Math.abs(portfolio.pnlMonthPercent) < 0.01 ? 0 : portfolio.pnlMonthPercent,
    };
  }, [portfolio]);

  const balanceParts = useMemo(() => {
    if (!portfolio) return { integer: '0', decimal: '00' };

    const formatted = formatSum(portfolio.marketPrice, { thousands: true, millions: false });

    const [integer, decimal] = formatted.split(/[.]/);
    return { integer, decimal, currency: getCurrencySymbol(portfolio.currencyCode) };
  }, [portfolio]);

  if (!portfolio) {
    return (
      <Block className={cx('portfolio-summary')} isLoading={isLoading}>
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

  const pnlMonthType =
    pnlMonth > 0
      ? AmountTextTypes.POSITIVE
      : pnlMonth < 0
        ? AmountTextTypes.NEGATIVE
        : AmountTextTypes.DEFAULT;

  return (
    <Block className={cx('portfolio-summary')} isLoading={isLoading}>
      <div className={cx('label')}>{t('Balance')}</div>

      <Tooltip text={`${formatNumber(portfolio.marketPrice)} ${balanceParts.currency}`}>
        <div className={cx('total-balance-container')}>
          <span className={cx('integer')}>{balanceParts.integer}</span>
          {balanceParts.decimal && <span className={cx('decimal')}>.{balanceParts.decimal}</span>}
        </div>
      </Tooltip>

      <div className={cx('pnl-badges')}>
        <div className={cx('pnl-badge', pnlType)}>
          <AmountText amount={totalPnl} type={pnlType} currency={portfolio.currencyCode} />
          <div className={cx('pnl-percent-container')}>
            <DirectionArrow value={totalPnl} />
            <PercentText value={totalPnlPercent} showPlus={false} />
          </div>
          <span className={cx('pnl-period')}>{t('AllTime')}</span>
        </div>

        <div className={cx('pnl-badge', pnlMonthType)}>
          <AmountText amount={pnlMonth} type={pnlMonthType} currency={portfolio.currencyCode} />
          <div className={cx('pnl-percent-container')}>
            <DirectionArrow value={pnlMonth} />
            <PercentText value={pnlMonthPercent} showPlus={false} />
          </div>
          <span className={cx('pnl-period')}>{t('ThisMonth')}</span>
        </div>
      </div>
    </Block>
  );
};
