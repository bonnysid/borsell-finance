import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useAssistantNotifications } from '@features/assistant-notifications';
import { NotificationsContainer } from '@shared/ui';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';
import { FC } from 'react';
import { Outlet } from 'react-router';

import styles from './PrivateLayout.module.scss';

type PrivateLayoutProps = {};

const cn = bindStyles(styles);

export const PrivateLayout: FC<PrivateLayoutProps> = () => {
  useAssistantNotifications();

  return (
    <div className={cn('private-layout')}>
      <Header />

      <div className={cn('content-wrapper')}>
        <Sidebar />

        <div className={cn('content')}>
          <Outlet />
        </div>
      </div>

      <NotificationsContainer />
    </div>
  );
};
