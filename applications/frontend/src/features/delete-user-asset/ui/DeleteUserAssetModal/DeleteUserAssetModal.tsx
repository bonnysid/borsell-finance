import {
  Button,
  ButtonVariants,
  bindStyles,
  Modal,
  ModalSharedProps,
} from '@devbonnysid/ui-kit-default';
import { ID } from '@packages/types';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useDeleteUserAsset } from '../../api';
import styles from './DeleteUserAssetModal.module.scss';

type DeleteUserAssetModalProps = ModalSharedProps & {
  symbol: string;
  userAsserId: ID;
};

const cx = bindStyles(styles);

export const DeleteUserAssetModal: FC<DeleteUserAssetModalProps> = ({
  onClose,
  userAsserId,
  symbol,
}) => {
  const { t } = useTranslation();
  const deleteUserAssetMutation = useDeleteUserAsset();

  const onDelete = async () => {
    try {
      await deleteUserAssetMutation.mutateAsync(userAsserId);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal
      onClose={onClose}
      className={cx('delete-user-asset-modal')}
      footer={
        <div className={cx('buttons')}>
          <Button variant={ButtonVariants.SECONDARY} isFullWidth onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            variant={ButtonVariants.QUATERNARY}
            isFullWidth
            onClick={onDelete}
            isLoading={deleteUserAssetMutation.isPending}
          >
            {t('Delete')}
          </Button>
        </div>
      }
    >
      <div className={cx('title')}>{t('deleteUserAsset.title', { symbol })}</div>
    </Modal>
  );
};
