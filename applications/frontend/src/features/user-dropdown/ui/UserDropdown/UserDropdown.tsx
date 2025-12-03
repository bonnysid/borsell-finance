import { bindStyles, Loader, useOpenState } from '@devbonnysid/ui-kit-default';
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

  return (
    <div className={cx('user-dropdown')}>
      <div ref={referenceRef} className={cx('trigger')}>
        {getMeQuery.isFetching && <Loader className={cx('loader')} />}
      </div>

      {dropdownControls.isOpen && (
        <UserMenu referenceRef={referenceRef} onClose={dropdownControls.close} />
      )}
    </div>
  );
};
