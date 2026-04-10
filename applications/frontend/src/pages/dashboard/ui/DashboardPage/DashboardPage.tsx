import { bindStyles } from '@devbonnysid/ui-kit-default';
import { PortfolioAllocation } from '@widgets/portfolio-allocation';
import { PortfolioHistoryChart } from '@widgets/portfolio-history-chart';
import { PortfolioSummary } from '@widgets/portfolio-summary';
import { FC } from 'react';

import styles from './DashboardPage.module.scss';

type DashboardPageProps = {};

const cn = bindStyles(styles);

export const DashboardPage: FC<DashboardPageProps> = () => {
  return (
    <div className={cn('dashboard-page')}>
      <div className={cn('main-content')}>
        <PortfolioHistoryChart />
      </div>
      <div className={cn('side-content')}>
        <PortfolioSummary />
        <PortfolioAllocation />
      </div>
    </div>
  );
};

export default DashboardPage;
