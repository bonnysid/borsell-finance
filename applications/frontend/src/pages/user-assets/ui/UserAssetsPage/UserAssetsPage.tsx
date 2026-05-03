import { bindStyles } from '@devbonnysid/ui-kit-default';
import { PageTitle, PageWrapper } from '@shared/ui';
import { UserAssetsWidget } from '@widgets/user-assets';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './UserAssetsPage.module.scss';

type UserAssetsPageProps = {};

const cx = bindStyles(styles);

export const UserAssetsPage: FC<UserAssetsPageProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <PageWrapper className={cx('user-assets-page')}>
      <PageTitle>{t('MyAssets')}</PageTitle>

      <UserAssetsWidget hasDelete />
    </PageWrapper>
  );
};

export default UserAssetsPage;
