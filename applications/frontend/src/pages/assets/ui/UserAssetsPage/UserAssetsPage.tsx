import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetUserAssets } from '@entities/assets';
import { EmptyUserAssets } from '@pages/assets/ui/EmptyUserAssets';
import { FC } from 'react';

import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { data } = useGetUserAssets();
  const isEmpty = data?.totalItems === 0;

  return <div className={cx('user-assets-page')}>{isEmpty && <EmptyUserAssets />}</div>;
};

export default UserAssetsPage;
