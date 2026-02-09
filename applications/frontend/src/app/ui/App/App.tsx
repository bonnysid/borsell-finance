import { AppRouter, QueryProvider } from '@app/providers';
import { useTheme } from '@devbonnysid/ui-kit-default';
import { initAuthInterceptor, useIsAuth } from '@entities/auth';
import { useGetMe } from '@entities/user';
import { FC } from 'react';

initAuthInterceptor();

export const App: FC = () => {
  const { isAuth } = useIsAuth();
  useGetMe(isAuth);
  useTheme();

  return (
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  );
};
