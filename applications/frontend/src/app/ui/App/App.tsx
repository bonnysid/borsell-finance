import { useTheme } from '@devbonnysid/ui-kit-default';
import { initAuthInterceptor, useIsAuth } from '@entities/auth';
import { useGetMe } from '@entities/user';
import { FC } from 'react';

import { AppRouter, QueryProvider } from '../../providers';

initAuthInterceptor();

const WrappedApp: FC = () => {
  const { isAuth } = useIsAuth();
  useGetMe(isAuth);
  useTheme();

  return <AppRouter />;
};

export const App: FC = () => {
  return (
    <QueryProvider>
      <WrappedApp />
    </QueryProvider>
  );
};
