import { bindStyles } from '@devbonnysid/ui-kit-default';
import { PortfolioAllocation } from '@widgets/portfolio-allocation';
import { PortfolioSummary } from '@widgets/portfolio-summary';
import { FC } from 'react';

import styles from './DashboardPage.module.scss';

type DashboardPageProps = {};

const cn = bindStyles(styles);

export const DashboardPage: FC<DashboardPageProps> = () => {
  return (
    <div className={cn('dashboard-page')}>
      <PortfolioSummary />
      <PortfolioAllocation />
    </div>
  );
};

export default DashboardPage;
