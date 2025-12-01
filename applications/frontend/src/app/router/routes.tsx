import { Layout } from '@app/Layout';
import { PrivateRoute, PublicRoute } from '@entities/auth';
import { AssistantPage } from '@pages/assistant';
import { AuthLayout, SignInPage, SignUpPage } from '@pages/auth';
import { DashboardPage } from '@pages/dasboard';
import { PortfolioPage } from '@pages/portfolios';
import { AppRoutePaths, AppRoutes } from '@shared/router';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';

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
            <Outlet />
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
        ],
      },
    ],
  },
];
