import { bindStyles } from '@devbonnysid/ui-kit-default';
import { useGetUserAssets } from '@entities/assets';
import { EmptyUserAssets } from '@pages/assets/ui/EmptyUserAssets';
import { UserAssetInfoCard } from '@pages/assets/ui/UserAssetInfoCard';
import { PageTitle, PageWrapper } from '@shared/ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { data } = useGetUserAssets();
  const isEmpty = data?.totalItems === 0;
  const { t } = useTranslation();

  return (
    <PageWrapper className={cx('user-assets-page')}>
      <PageTitle>{t('Assets')}</PageTitle>

      {isEmpty && <EmptyUserAssets />}
      {!isEmpty && (
        <div className={cx('assets')}>
          {data?.data.map((it) => (
            <UserAssetInfoCard key={it.id} userAsset={it} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default UserAssetsPage;
