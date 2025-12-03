import { bindStyles, Icon, Input, InputSizes } from '@devbonnysid/ui-kit-default';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './GlobalSearch.module.scss';

type GlobalSearchProps = {};

const cx = bindStyles(styles);

export const GlobalSearch: FC<GlobalSearchProps> = ({}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  return (
    <div className={cx('global-search')}>
      <Input
        size={InputSizes.MEDIUM}
        value={search}
        onChangeValue={setSearch}
        prefix={<Icon type="search" />}
        placeholder={t('Search')}
      />
    </div>
  );
};
