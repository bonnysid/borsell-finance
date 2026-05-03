import { bindStyles } from '@devbonnysid/ui-kit-default';
import { PageTitle, PageWrapper } from '@shared/ui';
import { TransactionsHistory } from '@widgets/transactions-history';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './TransactionsPage.module.scss';

type TransactionsPageProps = {};

const cn = bindStyles(styles);

export const TransactionsPage: FC<TransactionsPageProps> = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper className={cn('transactions-page')}>
      <PageTitle>{t('Transactions')}</PageTitle>
      <TransactionsHistory />
    </PageWrapper>
  );
};

export default TransactionsPage;
