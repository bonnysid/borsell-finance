import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import styles from './Layout.module.scss';

type LayoutProps = {};

const cn = bindStyles(styles);

export const Layout: FC<LayoutProps> = () => {
  return (
    <div className={cn('layout')}>
      <Outlet />
    </div>
  );
};
