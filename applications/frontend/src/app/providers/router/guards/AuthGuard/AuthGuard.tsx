import { useIsAuth } from '@entities/auth';
import { AppRoutePaths } from '@shared/router';
import { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

type PrivateRouteProps = PropsWithChildren<{}>;

export const AuthGuard: FC<PrivateRouteProps> = ({ children }) => {
  const { isAuth } = useIsAuth();

  if (!isAuth) {
    return <Navigate to={AppRoutePaths.AUTH_SIGN_IN()} />;
  }

  return <>{children}</>;
};
