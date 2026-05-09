import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetPortfolioAllocation } from '@entities/portfolio';
import { Block, DonutChart } from '@shared/ui';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PortfolioAllocation.module.scss';

type PortfolioAllocationProps = {};

const cx = bindStyles(styles);

export const PortfolioAllocation: FC<PortfolioAllocationProps> = ({}) => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPortfolioAllocation();

  const chartData = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item) => ({
      id: item.id,
      name: item.symbol,
      value: item.value,
      color: item.color,
    }));
  }, [data]);

  return (
    <Block
      title={t('PortfolioAllocation')}
      className={cx('portfolio-allocation')}
      isLoading={isLoading}
    >
      <DonutChart data={chartData} />
    </Block>
  );
};
