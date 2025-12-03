import { bindStyles, Popover, PopoverSharedProps } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './UserMenu.module.scss';

type UserMenuProps = PopoverSharedProps & {};

const cx = bindStyles(styles);

export const UserMenu: FC<UserMenuProps> = ({
  onClose,
  gap,
  placementAlignment,
  placementSide,
  referenceRef,
  isPortal,
}) => {
  return (
    <Popover
      onClose={onClose}
      gap={gap}
      placementAlignment={placementAlignment}
      placementSide={placementSide}
      referenceRef={referenceRef}
      isPortal={isPortal}
      className={cx('user-menu')}
    >
      user
    </Popover>
  );
};
