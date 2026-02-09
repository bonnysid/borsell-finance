import { bindStyles } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';

import styles from './AssetsPage.module.scss';

type AssetsPageProps = {};

const cx = bindStyles(styles);

export const AssetsPage: FC<AssetsPageProps> = ({}) => {
  return <div className={cx('assets-page')}>Assets page</div>;
};

export default AssetsPage;
