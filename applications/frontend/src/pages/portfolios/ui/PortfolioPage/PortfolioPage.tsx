import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolio } from '@entities/portfolio';
import { FC } from 'react';

import { EmptyPortfolio } from '../EmptyPortfolio';
import styles from './PortfolioPage.module.scss';

type PortfolioPageProps = {};

const cn = bindStyles(styles);

export const PortfolioPage: FC<PortfolioPageProps> = () => {
  const { data } = useGetPortfolio();

  if (!data) {
    return <EmptyPortfolio />;
  }

  return <div className={cn('portfolio-page')}>Portfolio</div>;
};

export default PortfolioPage;
