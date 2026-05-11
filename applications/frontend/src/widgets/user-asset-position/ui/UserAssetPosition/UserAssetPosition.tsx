import { bindStyles, Form, FormInput, formatNumber } from '@devbonnysid/ui-kit-default';
import { useGetAssetInfo, useGetUserAsset } from '@entities/assets';
import { BuyAssetButton } from '@features/buy-asset/ui';
import { SellAssetButton } from '@features/sell-asset/ui';
import { TransferAssetButton } from '@features/transfer-asset';
import { NumberString } from '@packages/types';
import { AmountText, AmountTextTypes, Block, RowInfo } from '@shared/ui';
import { schemeResolver, yupNumberString } from '@shared/utils';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import styles from './UserAssetPosition.module.scss';

type UserAssetPositionProps = {
  symbol: string;
  price?: number;
};

const cx = bindStyles(styles);

type FormValues = {
  price: NumberString;
  quantity: NumberString;
};

const validationSchema = yup.object({
  price: yupNumberString().required('Required'),
  quantity: yupNumberString().required('Required'),
});

export const UserAssetPosition: FC<UserAssetPositionProps> = ({ symbol, price }) => {
  const { data: assetInfo, isLoading: isLoadingAssetInfo } = useGetAssetInfo(symbol);
  const { isLoading, data, error } = useGetUserAsset(symbol);
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    defaultValues: {
      price: price?.toString() || '',
      quantity: '1',
    },
    resolver: schemeResolver(validationSchema),
  });

  const { price: formPrice, quantity: formQuantity } = form.watch();

  const resetQuantity = () => form.setValue('quantity', '1');

  const numUnrealizedPnl = Number(data?.unrealizedPnl || 0);
  const unrealizedPnlType =
    numUnrealizedPnl > 0
      ? AmountTextTypes.POSITIVE
      : numUnrealizedPnl === 0
        ? AmountTextTypes.DEFAULT
        : AmountTextTypes.NEGATIVE;

  const numRealizedPnl = Number(data?.realizedPnl || 0);
  const realizedPnlType =
    numRealizedPnl > 0
      ? AmountTextTypes.POSITIVE
      : numRealizedPnl === 0
        ? AmountTextTypes.DEFAULT
        : AmountTextTypes.NEGATIVE;

  useEffect(() => {
    if (price) {
      form.setValue('price', price.toString());
    }
  }, [price]);

  return (
    <Block
      className={cx('user-asset-position')}
      title={t('MyPosition')}
      isLoading={isLoading || isLoadingAssetInfo}
    >
      <RowInfo caption={t('Quantity')}>{formatNumber(data?.quantity || 0)}</RowInfo>
      <RowInfo caption={t('AvgBuyPrice')}>
        <AmountText amount={data?.avgBuyPrice} currency={data?.currencyCode} />
      </RowInfo>

      <RowInfo caption={t('CostBasis')}>
        <AmountText amount={data?.costBasis} currency={data?.currencyCode} />
      </RowInfo>
      <RowInfo caption={t('TotalCost')}>
        <AmountText amount={data?.cost} currency={data?.currencyCode} />
      </RowInfo>
      <RowInfo caption={t('RealizedPnL')}>
        <AmountText
          amount={data?.realizedPnl}
          currency={data?.currencyCode}
          type={realizedPnlType}
        />
      </RowInfo>
      <RowInfo caption={t('UnrealizedPnL')}>
        <AmountText
          amount={data?.unrealizedPnl}
          currency={data?.currencyCode}
          type={unrealizedPnlType}
        />
      </RowInfo>

      <Form className={cx('form')} form={form}>
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

        {assetInfo && (
          <div className={cx('actions')}>
            <BuyAssetButton
              assetId={assetInfo.id}
              symbol={symbol}
              currencyCode={assetInfo.currencyCode}
              price={formPrice}
              isFullWidth
              quantity={formQuantity}
              onSubmit={form.handleSubmit(resetQuantity)}
            />
            {data && (
              <div className={cx('actions-row')}>
                <SellAssetButton
                  assetId={assetInfo.id}
                  symbol={symbol}
                  currencyCode={assetInfo.currencyCode}
                  price={formPrice}
                  quantity={formQuantity}
                  isFullWidth
                  onSubmit={form.handleSubmit(resetQuantity)}
                />
                <TransferAssetButton
                  assetId={assetInfo.id}
                  symbol={symbol}
                  currencyCode={assetInfo.currencyCode}
                  price={formPrice}
                  quantity={formQuantity}
                  isFullWidth
                  onSubmit={form.handleSubmit(resetQuantity)}
                />
              </div>
            )}
          </div>
        )}
      </Form>
    </Block>
  );
};
