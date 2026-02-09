import { FC } from 'react';
import { RouterProvider } from 'react-router';

import { router } from './router';

export const AppRouter: FC = () => {
  return <RouterProvider router={router} />;
};
