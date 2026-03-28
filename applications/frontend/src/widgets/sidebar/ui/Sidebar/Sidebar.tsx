import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { SIDEBAR_LINKS } from '../../config';
import { SidebarMenuItem } from '../SidebarMenuItem';
import styles from './Sidebar.module.scss';

type SidebarProps = {};

const cx = bindStyles(styles);

export const Sidebar: FC<SidebarProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <div className={cx('sidebar')}>
      {SIDEBAR_LINKS.map((it) => (
        <SidebarMenuItem
          key={it.id}
          id={it.id}
          to={it.to}
          as="a"
          // @ts-expect-error
          caption={t(it.caption)}
          icon={it.icon}
          subItems={it.subItems}
        />
      ))}
    </div>
  );
};
