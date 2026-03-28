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

import { useTransferAsset } from '../../api';
import styles from './TransferAssetButton.module.scss';

type TransferAssetButtonProps = ButtonProps & {
  assetId: ID;
  symbol: string;
  currencyCode?: CurrencyCode;
  className?: string;
  price?: NumberString;
  quantity?: NumberString;
  onSubmit?: () => void;
};

const cx = bindStyles(styles);

export const TransferAssetButton: FC<TransferAssetButtonProps> = ({
  assetId,
  symbol,
  currencyCode,
  price,
  quantity,
  onClick,
  onSubmit,
  variant = ButtonVariants.SECONDARY,
  isLoading,
  ...props
}) => {
  const { t } = useTranslation();
  const transferAssetMutation = useTransferAsset();
  const modalControls = useOpenState();

  const onTransfer = async () => {
    await transferAssetMutation.mutateAsync({
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
        isLoading={transferAssetMutation.isPending || isLoading}
        {...props}
      >
        {t('Transfer')}
      </Button>

      {modalControls.isOpen && (
        <Modal
          onClose={modalControls.close}
          header={t('Transfer')}
          footer={
            <div className={cx('modal-actions')}>
              <Button variant={ButtonVariants.SECONDARY} isFullWidth onClick={modalControls.close}>
                {t('Cancel')}
              </Button>
              <Button
                variant={ButtonVariants.PRIMARY}
                isFullWidth
                onClick={onTransfer}
                isLoading={transferAssetMutation.isPending}
              >
                {t('Confirm')}
              </Button>
            </div>
          }
        >
          {t('transferAsset.confirm', { quantity, symbol, price })}
        </Modal>
      )}
    </>
  );
};
