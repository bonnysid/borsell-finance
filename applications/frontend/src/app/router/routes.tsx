import { Layout } from '@app/Layout';
import { PrivateLayout } from '@app/PrivateLayout';
import { PrivateRoute, PublicRoute } from '@entities/auth';
import { UserAssetsPage } from '@pages/assets';
import { AssistantPage } from '@pages/assistant';
import { AuthLayout, SignInPage, SignUpPage } from '@pages/auth';
import { DashboardPage } from '@pages/dasboard';
import { PortfolioPage } from '@pages/portfolios';
import { TransactionsPage } from '@pages/transactions';
import { AppRoutePaths, AppRoutes } from '@shared/router';
import { Navigate, RouteObject } from 'react-router';

export const ROUTES: RouteObject[] = [
  {
    path: '',
    element: <Layout />,
    children: [
      {
        path: AppRoutes.AUTH,
        element: (
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={AppRoutePaths.AUTH_SIGN_IN()} />,
          },
          {
            path: AppRoutes.AUTH_SIGN_IN,
            element: <SignInPage />,
          },
          {
            path: AppRoutes.AUTH_SIGN_UP,
            element: <SignUpPage />,
          },
        ],
      },

      {
        element: (
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={AppRoutePaths.DASHBOARD()} />,
          },
          {
            path: AppRoutes.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: AppRoutes.PORTFOLIO,
            element: <PortfolioPage />,
          },
          {
            path: AppRoutes.ASSISTANT,
            element: <AssistantPage />,
          },
          {
            path: AppRoutes.TRANSACTIONS,
            element: <TransactionsPage />,
          },
          {
            path: AppRoutes.ASSETS_ME,
            element: <UserAssetsPage />,
          },
          {
            path: '*',
            element: <Navigate to={AppRoutePaths.DASHBOARD()} />,
          },
        ],
      },
    ],
  },
];
