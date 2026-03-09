import { bindStyles } from '@devbonnysid/ui-kit-default';
import { AssetPrice, useGetAssetInfo, useGetAssetPrice } from '@entities/assets';
import { AppRoutePaths } from '@shared/router';
import { PageTitle, PageWrapper } from '@shared/ui';
import { ChartAssetPriceHistory } from '@widgets/chart-asset-price-history';
import { UserAssetPosition } from '@widgets/user-asset-position/ui/UserAssetPosition/UserAssetPosition';
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
  const { data: assetInfo } = useGetAssetInfo(params.symbol);
  const { data: assetPrice } = useGetAssetPrice(params.symbol);

  if (!params.symbol) {
    return <Navigate to={AppRoutePaths.ASSETS()} />;
  }

  return (
    <PageWrapper className={cx('asset-details-page')}>
      <PageTitle className={cx('title')}>
        {params.symbol}&nbsp;
        {assetInfo && <span>({assetInfo.name})</span>}
        {assetPrice && <AssetPrice assetPrice={assetPrice} />}
      </PageTitle>
      <div className={cx('top')}>
        <ChartAssetPriceHistory symbol={params.symbol} />

        <div className={cx('widgets')}>
          <UserAssetPosition symbol={params.symbol} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default AssetDetailsPage;
