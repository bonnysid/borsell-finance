import { bindStyles, mapToOption, Select, SelectOption } from '@devbonnysid/ui-kit-default';
import { Languages } from '@shared/i18n';
import { FC, useMemo, useOptimistic } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './ChangeLanguageSelect.module.scss';

type ChangeLanguageSelectProps = {};

const cx = bindStyles(styles);

export const ChangeLanguageSelect: FC<ChangeLanguageSelectProps> = ({}) => {
  const { i18n } = useTranslation();
  const [optimisticLanguage, setOptimisticLanguage] = useOptimistic(
    mapToOption<Languages, {}>(i18n.language as Languages, i18n.language.toUpperCase()),
    (_, newVal: SelectOption<Languages>) => newVal,
  );

  const handleChangeLanguage = async (option?: SelectOption<Languages>) => {
    if (option) {
      setOptimisticLanguage(option);

      try {
        await i18n.changeLanguage(option.value);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const options = useMemo<SelectOption<Languages>[]>(() => {
    return Object.values(Languages).map((it) => mapToOption<Languages, {}>(it, it.toUpperCase()));
  }, []);

  return (
    <Select
      value={optimisticLanguage}
      onChange={handleChangeLanguage}
      options={options}
      className={cx('change-language-select')}
      dropdownWidth={100}
    ></Select>
  );
};
