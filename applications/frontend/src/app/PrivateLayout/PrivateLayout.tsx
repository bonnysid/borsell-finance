import { bindStyles } from '@devbonnysid/ui-kit-default';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import styles from './PrivateLayout.module.scss';

type PrivateLayoutProps = {};

const cn = bindStyles(styles);

export const PrivateLayout: FC<PrivateLayoutProps> = () => {
  return (
    <div className={cn('private-layout')}>
      <Header />

      <div className={cn('content-wrapper')}>
        <Sidebar />

        <div className={cn('content')}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
