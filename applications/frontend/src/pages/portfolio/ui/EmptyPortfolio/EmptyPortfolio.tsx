import { Button, Plug } from '@devbonnysid/ui-kit-default';
import { AppRoutePaths } from '@shared/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type EmptyPortfolioProps = {};

export const EmptyPortfolio: FC<EmptyPortfolioProps> = ({}) => {
  const { t } = useTranslation();

  return (
    <Plug title={t('NoData')} text={t('EmptyPortfolio')}>
      <Button to={AppRoutePaths.ASSETS_OPERATIONS_CREATE()}>{t('AddAsset')}</Button>
    </Plug>
  );
};
