import { useGetUserAssets } from '@entities/assets';
import { FC } from 'react';

import { UserAssetsTable, UserAssetsTableProps } from '../UserAssetsTable';

type UserAssetsWidgetProps = Pick<UserAssetsTableProps, 'hasDelete'>;

export const UserAssetsWidget: FC<UserAssetsWidgetProps> = (props) => {
  const { data, isLoading, isFetching } = useGetUserAssets();

  return (
    <UserAssetsTable
      data={data?.data || []}
      isLoading={isLoading}
      isFetching={isFetching}
      {...props}
    />
  );
};
