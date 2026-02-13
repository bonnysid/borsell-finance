import { bindStyles } from '@devbonnysid/ui-kit-default';
import { TransactionType } from '@packages/types';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './TransactionTypeCell.module.scss';

type OperationTypeCellProps = {
  type: TransactionType;
};

const cx = bindStyles(styles);

export const TransactionTypeCell: FC<OperationTypeCellProps> = ({ type }) => {
  const { t } = useTranslation();

  return <div className={cx('operation-type-cell', type)}>{t(`operationType.${type}`)}</div>;
};
