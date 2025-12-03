import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './Sidebar.module.scss';

type SidebarProps = {};

const cx = bindStyles(styles);

export const Sidebar: FC<SidebarProps> = ({}) => {
  return <div className={cx('sidebar')}>sidebar</div>;
};
