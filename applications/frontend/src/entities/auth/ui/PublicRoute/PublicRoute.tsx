import { AppRoutePaths } from '@shared/router';
import { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

import { useIsAuth } from '../../model';

type PublicRouteProps = PropsWithChildren<{}>;

export const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const { isAuth } = useIsAuth();

  if (isAuth) {
    return <Navigate to={AppRoutePaths.DASHBOARD()} />;
  }

  return <>{children}</>;
};
