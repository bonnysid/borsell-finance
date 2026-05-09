import { Button, bindStyles, Icon, Popover, useOpenState } from '@devbonnysid/ui-kit-default';
import { useGetMe } from '@entities/user';
import { ChangeLanguageSelect } from '@features/change-language';
import { GlobalSearch } from '@features/global-search';
import { ChangeUserCurrencySelect } from '@features/user-change-currency';
import { UserDropdown } from '@features/user-dropdown';
import { AppRoutePaths } from '@shared/router';
import { Logo } from '@shared/ui';
import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

const cx = bindStyles(styles);

export const Header: FC = () => {
  const { t } = useTranslation();
  const getMe = useGetMe();
  const settingsControls = useOpenState();
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className={cx('header')}>
      <Logo className={cx('logo')} />

      <GlobalSearch />

      <div className={cx('right')}>

        <button
          ref={settingsTriggerRef}
          type="button"
          className={cx('settings-trigger')}
          title={t('Settings')}
          onClick={settingsControls.toggle}
        >
          <Icon type="settings" />
        </button>

        {settingsControls.isOpen && (
          <Popover
            referenceRef={settingsTriggerRef}
            onClose={settingsControls.close}
            width={240}
            gap={8}
            className={cx('settings-menu')}
          >
            <div className={cx('settings-row')}>
              <span>{t('Language')}</span>
              <ChangeLanguageSelect />
            </div>

            {getMe.data && (
              <div className={cx('settings-row')}>
                <span>{t('Currency')}</span>
                <ChangeUserCurrencySelect initialCurrencyCode={getMe.data.currencyCode} />
              </div>
            )}
          </Popover>
        )}

        <UserDropdown />
      </div>
    </div>
  );
};
