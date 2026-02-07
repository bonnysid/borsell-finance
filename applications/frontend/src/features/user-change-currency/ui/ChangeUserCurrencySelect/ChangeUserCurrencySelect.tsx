import { bindStyles, mapToOption, Select, SelectOption } from '@devbonnysid/ui-kit-default';
import { useGetAllCurrencies } from '@entities/currency';
import { useChangeUserCurrency } from '@features/user-change-currency';
import { CurrencyCode } from '@packages/types';
import { FC, useMemo, useOptimistic } from 'react';

import styles from './ChangeUserCurrencySelect.module.scss';

type ChangeUserCurrencySelectProps = {
  initialCurrencyCode: CurrencyCode;
};

const cx = bindStyles(styles);

export const ChangeUserCurrencySelect: FC<ChangeUserCurrencySelectProps> = ({
  initialCurrencyCode,
}) => {
  const [optimisticCurrency, setOptimisticCurrency] = useOptimistic(
    mapToOption<CurrencyCode, {}>(initialCurrencyCode, initialCurrencyCode),
    (_, newVal: SelectOption<CurrencyCode, {}>) => newVal,
  );
  const changeUserCurrencyMutation = useChangeUserCurrency();
  const getCurrenciesQuery = useGetAllCurrencies();

  const handleChangeCurrency = async (newCurrencyOption?: SelectOption<CurrencyCode>) => {
    if (newCurrencyOption) {
      setOptimisticCurrency(newCurrencyOption);

      try {
        await changeUserCurrencyMutation.mutateAsync({ currencyCode: newCurrencyOption.value });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const currenciesOptions = useMemo<SelectOption<CurrencyCode>[]>(() => {
    return (getCurrenciesQuery.data || []).map((it) => mapToOption(it.code, it.code));
  }, [getCurrenciesQuery.data]);

  return (
    <Select<CurrencyCode>
      isWithSearch
      value={optimisticCurrency}
      isLoading={changeUserCurrencyMutation.isPending || getCurrenciesQuery.isLoading}
      onChange={handleChangeCurrency}
      options={currenciesOptions}
      className={cx('change-user-currency-select')}
    />
  );
};
