import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetMe } from '@entities/user';
import { ChangeLanguageSelect } from '@features/change-language';
import { GlobalSearch } from '@features/global-search';
import { ChangeUserCurrencySelect } from '@features/user-change-currency';
import { UserDropdown } from '@features/user-dropdown';
import { AppRoutePaths } from '@shared/router';
import { Logo } from '@shared/ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Header.module.scss';

type HeaderProps = {};

const cx = bindStyles(styles);

export const Header: FC<HeaderProps> = ({}) => {
  const { t } = useTranslation();
  const getMe = useGetMe();

  return (
    <div className={cx('header')}>
      <Logo className={cx('logo')} />

      <GlobalSearch />

      <div className={cx('right')}>
        <Button to={AppRoutePaths.ASSETS_OPERATIONS_CREATE()}>{t('AddAsset')}</Button>
        <ChangeLanguageSelect />
        {getMe.data && <ChangeUserCurrencySelect initialCurrencyCode={getMe.data.currencyCode} />}
        <UserDropdown />
      </div>
    </div>
  );
};
