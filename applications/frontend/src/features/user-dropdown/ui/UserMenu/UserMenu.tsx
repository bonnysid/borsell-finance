import { bindStyles, Icon, Popover } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioSummary } from '@entities/portfolio';
import { useGetMe } from '@entities/user';
import { ChangeLanguageSelect } from '@features/change-language';
import { LogoutButton } from '@features/logout';
import { ChangeUserCurrencySelect } from '@features/user-change-currency';
import { AmountText, AmountTextTypes } from '@shared/ui';
import { getCurrencySymbol } from '@shared/utils';
import { formatSum } from '@shared/utils/sum';
import { FC, RefObject, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UserMenu.module.scss';

type UserMenuProps = {
  referenceRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

const cx = bindStyles(styles);

export const UserMenu: FC<UserMenuProps> = ({ referenceRef, onClose }) => {
  const { t } = useTranslation();
  const { data: user } = useGetMe();
  const { data: portfolio } = useGetPortfolioSummary();

  const balanceStr = useMemo(() => {
    if (!portfolio) return null;
    return `${formatSum(portfolio.marketPrice, { thousands: true, millions: false })} ${getCurrencySymbol(portfolio.currencyCode)}`;
  }, [portfolio]);

  const pnlMonth = portfolio ? Number(portfolio.pnlMonth) : 0;
  const pnlMonthType =
    pnlMonth > 0
      ? AmountTextTypes.POSITIVE
      : pnlMonth < 0
        ? AmountTextTypes.NEGATIVE
        : AmountTextTypes.DEFAULT;

  return (
    <Popover
      referenceRef={referenceRef}
      onClose={onClose}
      placement="bottom-end"
      gap={8}
      width="220px"
      className={cx('user-menu')}
    >
      {user && (
        <div className={cx('user-info')}>
          <div className={cx('user-avatar')}>
            <Icon type="user" />
          </div>
          <div className={cx('user-details')}>
            <span className={cx('username')}>{user.username}</span>
          </div>
        </div>
      )}

      {portfolio && balanceStr && (
        <div className={cx('portfolio-balance')}>
          <span className={cx('balance-label')}>{t('Balance')}</span>
          <span className={cx('balance-value')}>{balanceStr}</span>
          {Math.abs(pnlMonth) >= 0.01 && (
            <div className={cx('balance-pnl')}>
              <AmountText amount={pnlMonth} type={pnlMonthType} currency={portfolio.currencyCode} />
              <span className={cx('balance-pnl-period')}>{t('ThisMonth')}</span>
            </div>
          )}
        </div>
      )}

      <div className={cx('divider')} />

      <div className={cx('settings-row')}>
        <span className={cx('settings-label')}>{t('Language')}</span>
        <ChangeLanguageSelect />
      </div>

      {user && (
        <div className={cx('settings-row')}>
          <span className={cx('settings-label')}>{t('Currency')}</span>
          <ChangeUserCurrencySelect initialCurrencyCode={user.currencyCode} />
        </div>
      )}

      <div className={cx('divider')} />

      <LogoutButton className={cx('logout-btn')} />
    </Popover>
  );
};
