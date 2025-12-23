import { bindStyles } from '@devbonnysid/ui-kit-default';
import { UserAssetDtoShape } from '@packages/types';
import { FC } from 'react';

import styles from './UserAssetInfoCard.module.scss';

type UserAssetInfoCardProps = {
  userAsset: UserAssetDtoShape;
};

const cx = bindStyles(styles);

export const UserAssetInfoCard: FC<UserAssetInfoCardProps> = ({ userAsset }) => {
  return <div className={cx('user-asset-info-card')}>{userAsset.asset.name}</div>;
};
