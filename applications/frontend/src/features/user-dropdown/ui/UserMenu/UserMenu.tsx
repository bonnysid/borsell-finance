import { bindStyles, Icon, Popover } from '@devbonnysid/ui-kit-default';
import { useGetMe } from '@entities/user';
import { LogoutButton } from '@features/logout';
import { FC, RefObject } from 'react';
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

      <div className={cx('divider')} />

      <LogoutButton className={cx('logout-btn')} />
    </Popover>
  );
};
