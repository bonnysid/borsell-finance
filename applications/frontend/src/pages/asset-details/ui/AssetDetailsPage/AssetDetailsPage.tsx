import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './AssetDetailsPage.module.scss';

type AssetDetailsPageProps = {};

const cx = bindStyles(styles);

export const AssetDetailsPage: FC<AssetDetailsPageProps> = ({}) => {
  return <div className={cx('asset-details-page')}>asset-details</div>;
};

export default AssetDetailsPage;
