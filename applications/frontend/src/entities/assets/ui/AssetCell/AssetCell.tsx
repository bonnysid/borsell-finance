import { bindStyles } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { FC } from 'react';

import styles from './AssetCell.module.scss';

type AssetCellProps = {
  asset: AssetDtoShape;
};

const cx = bindStyles(styles);

export const AssetCell: FC<AssetCellProps> = ({ asset }) => {
  return <div className={cx('asset-cell')}>{asset.name}</div>;
};
