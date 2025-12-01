import { bindStyles } from '@devbonnysid/ui-kit-default';
import LogoSVG from '@shared/assets/img/logo.svg?react';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import styles from './AuthLayout.module.scss';

type AuthLayoutProps = {};

const cx = bindStyles(styles);

export const AuthLayout: FC<AuthLayoutProps> = () => {
  return (
    <div className={cx('auth-layout')}>
      <div className={cx('block')}>
        <div className={cx('header')}>
          <LogoSVG className={cx('logo')} />
        </div>

        <Outlet />
      </div>
    </div>
  );
};
