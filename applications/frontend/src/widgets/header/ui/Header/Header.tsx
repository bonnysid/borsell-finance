import { bindStyles } from '@devbonnysid/ui-kit-default';
import { GlobalSearch } from '@features/global-search';
import { UserDropdown } from '@features/user-dropdown';
import { Logo } from '@shared/ui';
import { FC } from 'react';

import styles from './Header.module.scss';

type HeaderProps = {};

const cx = bindStyles(styles);

export const Header: FC<HeaderProps> = ({}) => {
  return (
    <div className={cx('header')}>
      <Logo className={cx('logo')} />

      <GlobalSearch />

      <div className={cx('right')}>
        <UserDropdown />
      </div>
    </div>
  );
};
