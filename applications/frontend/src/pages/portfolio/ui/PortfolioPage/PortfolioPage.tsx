import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolio } from '@entities/portfolio';
import { PortfolioAllocation } from '@widgets/portfolio-allocation';
import { PortfolioHistoryChart } from '@widgets/portfolio-history-chart';
import { PortfolioSummary } from '@widgets/portfolio-summary';
import { UserAssetsWidget } from '@widgets/user-assets';
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

  return (
    <div className={cn('portfolio-page')}>
      <div className={cn('side-content')}>
        <PortfolioSummary />
        <PortfolioAllocation />
      </div>
      <div className={cn('main-content')}>
        <PortfolioHistoryChart />
        <UserAssetsWidget />
      </div>
    </div>
  );
};

export default PortfolioPage;
