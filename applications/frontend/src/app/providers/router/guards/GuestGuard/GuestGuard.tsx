import { useIsAuth } from '@entities/auth';
import { AppRoutePaths } from '@shared/router';
import { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

type PublicRouteProps = PropsWithChildren<{}>;

export const GuestGuard: FC<PublicRouteProps> = ({ children }) => {
  const { isAuth } = useIsAuth();

  if (isAuth) {
    return <Navigate to={AppRoutePaths.PORTFOLIO()} />;
  }

  return <>{children}</>;
};
