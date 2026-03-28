import { bindStyles, TextShorter } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { FC } from 'react';

import styles from './AssetCell.module.scss';

type AssetCellProps = {
  asset: AssetDtoShape;
};

const cx = bindStyles(styles);

export const AssetCell: FC<AssetCellProps> = ({ asset }) => {
  return (
    <TextShorter className={cx('asset-cell')}>
      {asset.symbol} ({asset.name})
    </TextShorter>
  );
};
