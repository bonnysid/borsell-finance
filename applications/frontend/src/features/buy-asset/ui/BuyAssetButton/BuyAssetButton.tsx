import {
  Button,
  ButtonProps,
  ButtonVariants,
  bindStyles,
  Modal,
  useOpenState,
} from '@devbonnysid/ui-kit-default';
import { CurrencyCode, ID, NumberString } from '@packages/types';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useBuyAsset } from '../../api';
import styles from './BuyAssetButton.module.scss';

type BuyAssetButtonProps = ButtonProps & {
  assetId: ID;
  symbol: string;
  currencyCode?: CurrencyCode;
  className?: string;
  price?: NumberString;
  quantity?: NumberString;
  onSubmit?: () => void;
};

const cx = bindStyles(styles);

export const BuyAssetButton: FC<BuyAssetButtonProps> = ({
  assetId,
  symbol,
  currencyCode,
  price,
  quantity,
  onClick,
  onSubmit,
  variant = ButtonVariants.PRIMARY,
  isLoading,
  ...props
}) => {
  const { t } = useTranslation();
  const buyAssetMutation = useBuyAsset();
  const modalControls = useOpenState();

  const onBuy = async () => {
    await buyAssetMutation.mutateAsync({
      assetId,
      symbol,
      price: Number(price),
      quantity: Number(quantity),
      currencyCode,
    });
    modalControls.close();
    onSubmit?.();
  };

  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    modalControls.open();
    onClick?.(e);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={onButtonClick}
        isLoading={buyAssetMutation.isPending || isLoading}
        {...props}
      >
        {t('Buy')}
      </Button>

      {modalControls.isOpen && (
        <Modal
          onClose={modalControls.close}
          header={t('Buy')}
          footer={
            <div className={cx('modal-actions')}>
              <Button variant={ButtonVariants.SECONDARY} isFullWidth onClick={modalControls.close}>
                {t('Cancel')}
              </Button>
              <Button
                variant={ButtonVariants.PRIMARY}
                isFullWidth
                onClick={onBuy}
                isLoading={buyAssetMutation.isPending}
              >
                {t('Confirm')}
              </Button>
            </div>
          }
        >
          {t('buyAsset.confirm', { quantity, symbol, price })}
        </Modal>
      )}
    </>
  );
};
