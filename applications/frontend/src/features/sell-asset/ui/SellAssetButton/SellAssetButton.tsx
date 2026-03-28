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

import { useSellAsset } from '../../api';
import styles from './SellAssetButton.module.scss';

type SellAssetButtonProps = ButtonProps & {
  assetId: ID;
  symbol: string;
  currencyCode?: CurrencyCode;
  className?: string;
  price?: NumberString;
  quantity?: NumberString;
  onSubmit?: () => void;
};

const cx = bindStyles(styles);

export const SellAssetButton: FC<SellAssetButtonProps> = ({
  assetId,
  symbol,
  currencyCode,
  price,
  quantity,
  onClick,
  onSubmit,
  variant = ButtonVariants.QUATERNARY,
  isLoading,
  ...props
}) => {
  const { t } = useTranslation();
  const sellAssetMutation = useSellAsset();
  const modalControls = useOpenState();

  const onSell = async () => {
    await sellAssetMutation.mutateAsync({
      assetId,
      symbol,
      price: Number(price),
      quantity: Number(quantity),
      currencyCode,
    });
    modalControls.close();
    onSubmit?.();
  };

  const onButtonClick: ButtonProps['onClick'] = (e) => {
    modalControls.open();
    onClick?.(e);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={onButtonClick}
        isLoading={sellAssetMutation.isPending || isLoading}
        {...props}
      >
        {t('Sell')}
      </Button>

      {modalControls.isOpen && (
        <Modal
          onClose={modalControls.close}
          header={t('Sell')}
          footer={
            <div className={cx('modal-actions')}>
              <Button variant={ButtonVariants.SECONDARY} isFullWidth onClick={modalControls.close}>
                {t('Cancel')}
              </Button>
              <Button
                variant={ButtonVariants.QUATERNARY}
                isFullWidth
                onClick={onSell}
                isLoading={sellAssetMutation.isPending}
              >
                {t('Confirm')}
              </Button>
            </div>
          }
        >
          {t('sellAsset.confirm', { quantity, symbol, price })}
        </Modal>
      )}
    </>
  );
};
