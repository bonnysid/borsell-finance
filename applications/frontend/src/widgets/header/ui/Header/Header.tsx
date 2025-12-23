import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import { GlobalSearch } from '@features/global-search';
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

  return (
    <div className={cx('header')}>
      <Logo className={cx('logo')} />

      <GlobalSearch />

      <div className={cx('right')}>
        <Button to={AppRoutePaths.ASSETS_OPERATIONS_CREATE()}>{t('AddAsset')}</Button>
        <UserDropdown />
      </div>
    </div>
  );
};
