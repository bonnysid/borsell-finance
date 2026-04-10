import { bindStyles, Icon } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { FC, useMemo, useState } from 'react';

import styles from './AssetLogo.module.scss';

type AssetLogoProps = {
  asset: AssetDtoShape;
  className?: string;
};

const cx = bindStyles(styles);

export const AssetLogo: FC<AssetLogoProps> = ({ asset, className }) => {
  const [error, setError] = useState(false);

  const icon = useMemo(() => {
    if (asset.metadata.isin) {
      return `https://invest-brands.cdn-tinkoff.ru/${asset.metadata.isin}x160.png`;
    }
    return null;
  }, [asset.metadata.isin]);

  if (!icon || error) {
    return (
      <div className={cx('asset-logo', 'fallback', className)}>
        <Icon type="bar-chart-alt" />
      </div>
    );
  }

  return (
    <div className={cx('asset-logo', className)}>
      <img
        src={icon}
        alt={asset.name}
        onError={() => setError(true)}
      />
    </div>
  );
};
