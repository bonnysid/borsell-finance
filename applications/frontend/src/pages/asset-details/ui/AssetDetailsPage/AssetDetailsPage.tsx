import { bindStyles } from '@devbonnysid/ui-kit-default';
import { AppRoutePaths } from '@shared/router';
import { LineChartAssetPriceHistory } from '@widgets/line-chart-asset-price-history';
import { FC } from 'react';
import { Navigate } from 'react-router';
import { useParams } from 'react-router-dom';

import styles from './AssetDetailsPage.module.scss';

type AssetDetailsPageProps = {};

const cx = bindStyles(styles);

type Params = {
  symbol: string;
};

export const AssetDetailsPage: FC<AssetDetailsPageProps> = ({}) => {
  const params = useParams<Params>();

  if (!params.symbol) {
    return <Navigate to={AppRoutePaths.ASSETS()} />;
  }

  return (
    <div className={cx('asset-details-page')}>
      <LineChartAssetPriceHistory symbol={params.symbol} />
    </div>
  );
};

export default AssetDetailsPage;
