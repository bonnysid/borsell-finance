import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetAssets } from '@entities/assets';
import { FC } from 'react';

import styles from './UserAssetCreatePage.module.scss';

type UserAssetCreatePageProps = {};

const cx = bindStyles(styles);

export const UserAssetCreatePage: FC<UserAssetCreatePageProps> = ({}) => {
  const { data } = useGetAssets();

  return <div className={cx('user-asset-create-page')}>user asset create</div>;
};

export default UserAssetCreatePage;
