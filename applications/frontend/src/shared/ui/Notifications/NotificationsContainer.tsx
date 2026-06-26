import { bindStyles } from '@devbonnysid/ui-kit-default';
import { AppNotification, useNotifications } from '@shared/model';
import { AppRoutePaths } from '@shared/router';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router';

import styles from './Notifications.module.scss';

const cn = bindStyles(styles);

const AUTO_DISMISS_MS = 8000;

type ToastProps = {
  notification: AppNotification;
  onClick: (notification: AppNotification) => void;
  onClose: (id: string) => void;
};

const Toast: FC<ToastProps> = ({ notification, onClick, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(notification.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const clickable = !!notification.sessionId;

  return (
    <div
      className={cn('toast', { clickable })}
      onClick={clickable ? () => onClick(notification) : undefined}
    >
      <span className={cn('icon')}>💬</span>
      <div className={cn('body')}>
        <div className={cn('title')}>{notification.title}</div>
        {notification.body && <div className={cn('text')}>{notification.body}</div>}
      </div>
      <button
        type="button"
        className={cn('close')}
        onClick={(e) => {
          e.stopPropagation();
          onClose(notification.id);
        }}
      >
        ×
      </button>
    </div>
  );
};

export const NotificationsContainer: FC = () => {
  const navigate = useNavigate();
  const notifications = useNotifications((s) => s.notifications);
  const dismiss = useNotifications((s) => s.dismiss);

  if (notifications.length === 0) {
    return null;
  }

  const handleClick = (notification: AppNotification) => {
    if (notification.sessionId) {
      navigate(AppRoutePaths.ASSISTANT(undefined, { session: notification.sessionId }));
    }
    dismiss(notification.id);
  };

  return (
    <div className={cn('container')}>
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onClick={handleClick} onClose={dismiss} />
      ))}
    </div>
  );
};
