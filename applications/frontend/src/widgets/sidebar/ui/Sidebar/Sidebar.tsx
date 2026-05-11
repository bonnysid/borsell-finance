import { bindStyles, Icon, useTheme } from '@devbonnysid/ui-kit-default';
import { ChangeThemeToggle } from '@features/change-theme/ui';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SIDEBAR_LINKS } from '../../config';
import { SidebarMenuItem } from '../SidebarMenuItem';
import styles from './Sidebar.module.scss';

const cx = bindStyles(styles);

export const Sidebar: FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className={cx('sidebar', { collapsed })}>
      <div className={cx('nav')}>
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
            isCollapsed={collapsed}
          />
        ))}
      </div>

      <div className={cx('bottom')}>
        <ChangeThemeToggle isMinimized={collapsed} />

        <div className={cx('divider')} />

        <button
          type="button"
          className={cx('collapse-btn', { collapsed })}
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? t('ExpandMenu') : t('CollapseMenu')}
        >
          {!collapsed && <span className={cx('label')}>{t('CollapseMenu')}</span>}
          <Icon type="chevron-left" className={cx('collapse-icon', { collapsed })} />
        </button>
      </div>
    </div>
  );
};
