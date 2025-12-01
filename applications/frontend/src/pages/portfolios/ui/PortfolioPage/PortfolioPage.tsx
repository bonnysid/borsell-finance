import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './PortfolioPage.module.scss';

type PortfolioPageProps = {};

const cn = bindStyles(styles);

export const PortfolioPage: FC<PortfolioPageProps> = () => {
  return <div className={cn('Portfolio-page')}>Portfolio</div>;
};

export default PortfolioPage;
