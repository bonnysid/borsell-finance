import { FC, Suspense } from 'react';
import { useRoutes } from 'react-router';

import { ROUTES } from './routes';

export const Router: FC = () => {
  const routes = useRoutes(ROUTES);

  return <Suspense fallback="Loading...">{routes}</Suspense>;
};
