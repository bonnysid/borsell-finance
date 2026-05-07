import { bindStyles, Icon } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { CSSProperties, FC, useMemo, useState } from 'react';

import styles from './AssetLogo.module.scss';

type AssetLogoProps = {
  asset: AssetDtoShape;
  className?: string;
  size?: number;
};

const cx = bindStyles(styles);

export const AssetLogo: FC<AssetLogoProps> = ({ asset, className, size = 32 }) => {
  const [error, setError] = useState(false);

  const icon = useMemo(() => {
    if (asset.metadata.isin) {
      return `https://invest-brands.cdn-tinkoff.ru/${asset.metadata.isin}x160.png`;
    }
    return null;
  }, [asset.metadata.isin]);

  const styles = {
    '--logo-size': `${size}px`,
  } as CSSProperties;

  if (!icon || error) {
    return (
      <div className={cx('asset-logo', 'fallback', className)}>
        <Icon type="bar-chart-alt" />
      </div>
    );
  }

  return (
    <div className={cx('asset-logo', className)} style={styles}>
      <img src={icon} alt={asset.name} onError={() => setError(true)} />
    </div>
  );
};
