import { Button, bindStyles } from '@devbonnysid/ui-kit-default';
import { AppRoutePaths } from '@shared/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EmptyPortfolio.module.scss';

type EmptyPortfolioProps = {};

const cx = bindStyles(styles);

export const EmptyPortfolio: FC<EmptyPortfolioProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <div className={cx('empty-portfolio')}>
      <div className={cx('text')}>{t('NoData')}</div>
      <Button to={AppRoutePaths.PORTFOLIO_CREATE()}>{t('CreatePortfolio')}</Button>
    </div>
  );
};
