import { bindStyles, Icon, useTheme } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ChangeThemeToggle.module.scss';

type ChangeThemeToggleProps = {
  className?: string;
  isMinimized?: boolean;
};

const cx = bindStyles(styles);

const ICON_SIZE = 18;

export const ChangeThemeToggle: FC<ChangeThemeToggleProps> = ({ isMinimized, className }) => {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (isMinimized) {
    return (
      <button
        type="button"
        className={cx(className, 'theme-icon-btn')}
        onClick={handleToggle}
        title={t('Theme')}
      >
        {isDark ? <Icon type="moon" size={ICON_SIZE} /> : <Icon type="sun" size={ICON_SIZE} />}
      </button>
    );
  }

  return (
    <div className={cx(className, 'change-theme-toggle')}>
      <span className={cx('label')}>{t('Theme')}</span>
      <button type="button" className={cx('theme-toggle')} onClick={handleToggle}>
        <div className={cx('theme-btn', { active: isDark })} title="Dark">
          <Icon type="moon" size={ICON_SIZE} />
        </div>
        <div className={cx('theme-btn', { active: !isDark })} title="Light">
          <Icon type="sun" size={ICON_SIZE} />
        </div>
      </button>
    </div>
  );
};
