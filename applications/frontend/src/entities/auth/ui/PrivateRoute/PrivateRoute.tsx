import { AppRoutePaths } from '@shared/router';
import { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useIsAuth } from '../../model';

type PrivateRouteProps = PropsWithChildren<{}>;

export const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const { isAuth } = useIsAuth();

  if (!isAuth) {
    return <Navigate to={AppRoutePaths.AUTH_SIGN_IN()} />;
  }

  return <>{children}</>;
};
