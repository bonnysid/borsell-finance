import { bindStyles, Icon, Loader, useOpenState } from '@devbonnysid/ui-kit-default';
import { useGetMe } from '@entities/user';
import { FC, useRef } from 'react';

import { UserMenu } from '../UserMenu';
import styles from './UserDropdown.module.scss';

type UserDropdownProps = {};

const cx = bindStyles(styles);

export const UserDropdown: FC<UserDropdownProps> = ({}) => {
  const dropdownControls = useOpenState();
  const getMeQuery = useGetMe();
  const referenceRef = useRef<HTMLDivElement | null>(null);
  const isReady = Boolean(getMeQuery.isSuccess && getMeQuery.data);

  const handleClickTrigger = () => {
    if (isReady) {
      dropdownControls.toggle();
    }
  };

  return (
    <div className={cx('user-dropdown')}>
      <div ref={referenceRef} className={cx('trigger', { isReady })} onClick={handleClickTrigger}>
        {getMeQuery.isLoading && <Loader className={cx('loader')} />}

        {isReady && <Icon type="user" className={cx('trigger-icon')} />}
      </div>

      {dropdownControls.isOpen && (
        <UserMenu referenceRef={referenceRef} onClose={dropdownControls.close} />
      )}
    </div>
  );
};
