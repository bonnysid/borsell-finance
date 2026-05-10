import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolio } from '@entities/portfolio';
import { PortfolioAllocation } from '@widgets/portfolio-allocation';
import { PortfolioHistoryChart } from '@widgets/portfolio-history-chart';
import { PortfolioInsight } from '@widgets/portfolio-insight';
import { PortfolioSummary } from '@widgets/portfolio-summary';
import { UserAssetsWidget } from '@widgets/user-assets';
import { FC } from 'react';

import { EmptyPortfolio } from '../EmptyPortfolio';
import styles from './PortfolioPage.module.scss';

const cn = bindStyles(styles);

export const PortfolioPage: FC = () => {
  const { data } = useGetPortfolio();

  if (!data) {
    return <EmptyPortfolio />;
  }

  return (
    <div className={cn('portfolio-page')}>
      <div className={cn('widgets')}>
        <PortfolioInsight compact />
        <PortfolioSummary />
        <PortfolioAllocation />
      </div>

      <div className={cn('row')}>
        <PortfolioHistoryChart />
      </div>

      <UserAssetsWidget hasDelete />
    </div>
  );
};

export default PortfolioPage;
