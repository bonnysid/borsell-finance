import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetUserAssets } from '@entities/assets';
import { FC } from 'react';

import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { data } = useGetUserAssets();

  return <div className={cx('user-assets-page')}></div>;
};

export default UserAssetsPage;
