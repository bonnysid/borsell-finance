import { bindStyles, TextShorter } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { FC } from 'react';

import { AssetLogo } from '../AssetLogo';
import styles from './AssetCell.module.scss';

type AssetCellProps = {
  asset: AssetDtoShape;
};

const cx = bindStyles(styles);

export const AssetCell: FC<AssetCellProps> = ({ asset }) => {
  return (
    <div className={cx('asset-cell')}>
      <AssetLogo asset={asset} className={cx('logo')} />
      <TextShorter className={cx('name')}>
        {asset.symbol} ({asset.name})
      </TextShorter>
    </div>
  );
};
