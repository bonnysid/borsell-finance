import {
  bindStyles,
  Icon,
  Input,
  InputSizes,
  Loader,
  Popover,
  TextShorter,
  useDebounce,
} from '@devbonnysid/ui-kit-default';
import { AssetLogo, useSearchAssets } from '@entities/assets';
import { AssetSearchResultDtoShape, AssetType } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { FC, KeyboardEvent, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import styles from './GlobalSearch.module.scss';

const cx = bindStyles(styles);
const MIN_SEARCH_LENGTH = 2;
const SEARCH_LIMIT = 8;

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  [AssetType.STOCK]: 'Stock',
  [AssetType.ETF]: 'ETF',
  [AssetType.CRYPTO]: 'Crypto',
  [AssetType.BOND]: 'Bond',
  [AssetType.INDEX]: 'Index',
  [AssetType.FOREX]: 'Forex',
  [AssetType.COMMODITY]: 'Commodity',
  [AssetType.CSGO_SKIN]: 'CS:GO skin',
  [AssetType.CASH]: 'Cash',
  [AssetType.CURRENCY]: 'Currency',
};

export const GlobalSearch: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const referenceRef = useRef<HTMLDivElement | null>(null);
  const debouncedSearch = useDebounce(search, 350);
  const normalizedSearch = debouncedSearch.trim();
  const searchQuery = useSearchAssets(normalizedSearch, SEARCH_LIMIT);

  const results = useMemo(() => searchQuery.data ?? [], [searchQuery.data]);
  const isReadyToSearch = search.trim().length >= MIN_SEARCH_LENGTH;
  const isDropdownOpen = isFocused && isReadyToSearch;
  const isDebouncing = search.trim() !== normalizedSearch;
  const isLoading = isDebouncing || searchQuery.isFetching;

  const handleSelectAsset = (asset: AssetSearchResultDtoShape) => {
    setSearch('');
    setIsFocused(false);
    navigate(AppRoutePaths.ASSETS_DETAILS({ symbol: asset.symbol }, { type: asset.type }));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && results[0]) {
      handleSelectAsset(results[0]);
    }

    if (event.key === 'Escape') {
      setIsFocused(false);
    }
  };

  return (
    <div ref={referenceRef} className={cx('global-search')}>
      <Input
        size={InputSizes.MEDIUM}
        value={search}
        onChangeValue={setSearch}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        prefix={<Icon type="search" />}
        placeholder={t('Search')}
        controllerClassname={cx('input')}
        isClearable
      />

      {isDropdownOpen && (
        <Popover
          referenceRef={referenceRef}
          onClose={() => setIsFocused(false)}
          width={420}
          gap={8}
          className={cx('dropdown')}
          maxMenuHeight={360}
        >
          {isLoading && (
            <div className={cx('state')}>
              <Loader />
            </div>
          )}

          {!isLoading && searchQuery.isError && (
            <div className={cx('state')}>{t('SearchError')}</div>
          )}

          {!isLoading && searchQuery.isSuccess && results.length === 0 && (
            <div className={cx('state')}>{t('NoData')}</div>
          )}

          {!isLoading &&
            results.map((asset) => (
              <button
                key={`${asset.source}-${asset.symbol}`}
                type="button"
                className={cx('card')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelectAsset(asset)}
              >
                <AssetLogo asset={asset} size={36} className={cx('logo')} />

                <span className={cx('content')}>
                  <span className={cx('title')}>
                    <TextShorter>{asset.name}</TextShorter>
                    <span>{asset.symbol}</span>
                  </span>

                  <span className={cx('type')}>
                    {/* @ts-ignore */}
                    {t(ASSET_TYPE_LABELS[asset.type] || asset.type)}
                    {asset.source === 'MOEX' && <span>MOEX</span>}
                  </span>
                </span>
              </button>
            ))}
        </Popover>
      )}
    </div>
  );
};
