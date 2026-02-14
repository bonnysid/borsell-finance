import { Button, ButtonProps, ButtonVariants } from '@devbonnysid/ui-kit-default';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '../../api';

type LogoutButtonProps = Omit<ButtonProps, 'onClick' | 'isLoading' | 'variant'>;

export const LogoutButton: FC<LogoutButtonProps> = (props) => {
  const { t } = useTranslation();
  const logoutMutation = useLogout();

  const handleClick = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      {...props}
      isLoading={logoutMutation.isPending}
      onClick={handleClick}
      variant={ButtonVariants.QUATERNARY}
    >
      {t('Logout')}
    </Button>
  );
};
