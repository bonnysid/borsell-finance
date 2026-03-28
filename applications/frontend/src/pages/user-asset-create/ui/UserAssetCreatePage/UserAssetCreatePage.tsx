import {
  Button,
  bindStyles,
  Form,
  FormInput,
  FormSelect,
  SelectOption,
} from '@devbonnysid/ui-kit-default';
import { useGetAssets } from '@entities/assets';
import { useGetAllCurrencies } from '@entities/currency';
import { useCreateTransaction } from '@entities/transaction';
import { useGetMe } from '@entities/user';
import { CurrencyCode, NumberString, TransactionType } from '@packages/types';
import { AppRoutePaths } from '@shared/router';
import { PageTitle, PageWrapper } from '@shared/ui';
import { schemeResolver, yupNumberString, yupSelectOption } from '@shared/utils';
import { FC, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';

import styles from './UserAssetCreatePage.module.scss';

type UserAssetCreatePageProps = {};

const cx = bindStyles(styles);

type FormValues = {
  assetId: SelectOption;
  type: SelectOption<TransactionType>;
  currencyCode?: SelectOption<CurrencyCode>;
  price: NumberString;
  quantity: NumberString;
};

const validationSchema = yup.object({
  assetId: yupSelectOption().required('Required'),
  type: yupSelectOption<TransactionType>().required('Required'),
  currencyCode: yupSelectOption<CurrencyCode>(),
  price: yupNumberString().required('Required'),
  quantity: yupNumberString().required('Required'),
});

export const UserAssetCreatePage: FC<UserAssetCreatePageProps> = ({}) => {
  const assets = useGetAssets();
  const me = useGetMe();
  const currencies = useGetAllCurrencies();
  const createTransactionMutation = useCreateTransaction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const assetOptions = useMemo<SelectOption[]>(() => {
    return (
      assets.data?.data?.map((it) => ({
        label: `${it.symbol} ${it.symbol !== it.name ? `(${it.name})` : ''}`,
        value: it.id,
      })) || []
    );
  }, [assets?.data]);

  const currenciesOptions = useMemo<SelectOption<CurrencyCode>[]>(() => {
    return (
      currencies.data?.map((it) => ({
        label: it.code,
        value: it.code,
      })) || []
    );
  }, [currencies.data]);

  const operationTypeOptions = useMemo<SelectOption<TransactionType>[]>(() => {
    return Object.values(TransactionType).map((it) => ({
      label: t(`operationType.${it}`),
      value: it,
    }));
  }, [t]);

  const form = useForm<FormValues>({
    defaultValues: {
      price: '',
      quantity: '',
      type: operationTypeOptions[0],
      currencyCode: me.data?.currencyCode
        ? { value: me.data.currencyCode, label: me.data.currencyCode }
        : undefined,
    },
    resolver: schemeResolver(validationSchema),
  });

  const onSubmit = async (value: FormValues) => {
    try {
      await createTransactionMutation.mutateAsync({
        assetId: value.assetId.value,
        currencyCode: value.currencyCode?.value,
        quantity: Number(value.quantity),
        price: Number(value.price),
        type: value.type?.value,
      });

      navigate(AppRoutePaths.ASSETS_ME());
    } catch (e) {
      console.error(e);
    }
  };

  const asset = form.watch('assetId');

  useEffect(() => {
    const symbol = searchParams.get('symbol');

    if (symbol && assets.data && !asset) {
      const candidate = assets.data.data.find((it) => it.symbol === symbol);

      if (candidate) {
        form.setValue('assetId', {
          value: candidate.id,
          label: `${candidate.symbol} ${candidate.symbol !== candidate.name ? `(${candidate.name})` : ''}`,
        });
      }
    }
  }, [assets.data, searchParams]);

  useEffect(() => {
    if (assets.data && asset) {
      const candidate = assets.data.data.find((it) => it.id === asset.value);
      if (candidate) {
        form.setValue('currencyCode', {
          value: candidate.currencyCode,
          label: candidate.currencyCode,
        });
        form.setValue('price', candidate.cachedMarketPrice);
      }
    }
  }, [asset]);

  return (
    <PageWrapper className={cx('user-asset-create-page')}>
      <PageTitle title={t('AddAsset')} />

      <Form className={cx('form')} form={form} onSubmit={onSubmit}>
        <FormSelect
          name="assetId"
          options={assetOptions}
          caption={t('Asset')}
          placeholder={t('Asset')}
        />

        <FormInput
          type="number"
          name="price"
          decimals={6}
          caption={t('Price')}
          placeholder={t('Price')}
        />

        <FormInput
          type="number"
          name="quantity"
          caption={t('Quantity')}
          placeholder={t('Quantity')}
        />

        <FormSelect
          name="currencyCode"
          options={currenciesOptions}
          caption={t('Currency')}
          placeholder={t('Currency')}
        />

        <Button type="submit">{t('Create')}</Button>
      </Form>
    </PageWrapper>
  );
};

export default UserAssetCreatePage;
