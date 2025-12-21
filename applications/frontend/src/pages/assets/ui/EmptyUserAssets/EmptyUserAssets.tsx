import { Button, Plug } from '@devbonnysid/ui-kit-default';
import { AppRoutePaths } from '@shared/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type EmptyUserAssetsProps = {};

export const EmptyUserAssets: FC<EmptyUserAssetsProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <Plug title={t('NoData')}>
      <Button to={AppRoutePaths.ASSETS_OPERATIONS_CREATE()}>{t('AddAsset')}</Button>
    </Plug>
  );
};
