import { useTheme } from '@devbonnysid/ui-kit-default';
import { useIsAuth } from '@entities/auth';
import { useGetMe } from '@entities/user';
import { FC } from 'react';

import { Router } from './router';

export const App: FC = () => {
  const { isAuth } = useIsAuth();
  useTheme();
  useGetMe(isAuth);

  return (
    <>
      <Router />
    </>
  );
};
