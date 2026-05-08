import { bindStyles, Icon } from '@devbonnysid/ui-kit-default';
import { AssetDtoShape } from '@packages/types';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';

import styles from './AssetLogo.module.scss';

type AssetLogoMetadata = AssetDtoShape['metadata'] & {
  logoName?: string;
};

type AssetLogoProps = {
  asset: AssetDtoShape;
  className?: string;
  size?: number;
};

const cx = bindStyles(styles);

const TBANK_LOGO_SIZE = 160;
const TBANK_BRANDS_CDN_URL = 'https://invest-brands.cdn-tinkoff.ru';
const LOGO_DEV_LOGO_SIZE = 64;
const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

const buildTBankLogoUrl = (logoName?: string | null) => {
  const normalizedLogoName = logoName?.trim();

  if (!normalizedLogoName) return null;

  return `${TBANK_BRANDS_CDN_URL}/${normalizedLogoName}x${TBANK_LOGO_SIZE}.png`;
};

const buildLogoDevTickerUrl = (ticker?: string | null) => {
  const normalizedTicker = ticker?.trim();

  if (!normalizedTicker || !LOGO_DEV_TOKEN) return null;

  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    size: LOGO_DEV_LOGO_SIZE.toString(),
  });

  return `https://img.logo.dev/ticker/${encodeURIComponent(normalizedTicker)}?${params}`;
};

const getUniqueItems = <T,>(items: (T | null | undefined | false)[]) => {
  return Array.from(new Set(items.filter(Boolean))) as T[];
};

export const AssetLogo: FC<AssetLogoProps> = ({ asset, className, size = 32 }) => {
  const [iconIndex, setIconIndex] = useState(0);
  const metadata = asset.metadata as AssetLogoMetadata;

  const icons = useMemo(() => {
    return getUniqueItems<string>([
      metadata.iconUrl,
      buildTBankLogoUrl(metadata.logoName),
      buildTBankLogoUrl(metadata.isin),
      buildTBankLogoUrl(metadata.ticker),
      buildTBankLogoUrl(asset.moexSecurityId),
      buildTBankLogoUrl(asset.symbol),
      buildLogoDevTickerUrl(metadata.ticker),
      buildLogoDevTickerUrl(asset.moexSecurityId),
      buildLogoDevTickerUrl(asset.symbol),
    ]);
  }, [
    metadata.iconUrl,
    metadata.logoName,
    metadata.isin,
    metadata.ticker,
    asset.moexSecurityId,
    asset.symbol,
  ]);

  const icon = icons[iconIndex];

  const styles = {
    '--logo-size': `${size}px`,
  } as CSSProperties;

  useEffect(() => {
    setIconIndex(0);
  }, [icons]);

  const handleLoadError = () => {
    setIconIndex((index) => index + 1);
  };

  if (!icon) {
    return (
      <div className={cx('asset-logo', 'fallback', className)} style={styles}>
        <Icon type="bar-chart-alt" />
      </div>
    );
  }

  return (
    <div className={cx('asset-logo', className)} style={styles}>
      <img src={icon} alt={asset.name} onError={handleLoadError} />
    </div>
  );
};
