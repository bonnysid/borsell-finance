import { AppRoutePaths, AppRoutes } from '@shared/router';
import { lazy } from 'react';
import { Navigate } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';

import { AuthGuard, GuestGuard } from './guards';
import { AuthLayout, Layout, PrivateLayout } from './layouts';

const SignInPage = lazy(() => import('@pages/sign-in'));
const SignUpPage = lazy(() => import('@pages/sign-up'));
const DashboardPage = lazy(() => import('@pages/dashboard'));
const PortfolioPage = lazy(() => import('@pages/portfolio'));
const AssistantPage = lazy(() => import('@pages/assistant'));
const TransactionsPage = lazy(() => import('@pages/transactions'));
const UserAssetsPage = lazy(() => import('@pages/user-assets'));
const UserAssetCreatePage = lazy(() => import('@pages/user-asset-create'));
const AssetDetailsPage = lazy(() => import('@pages/asset-details'));
const AssetsStocksPage = lazy(() => import('@pages/assets-stocks'));
const AssetsEtfsPage = lazy(() => import('@pages/assets-etfs'));

export const router = createBrowserRouter([
  {
    path: '',
    element: <Layout />,
    children: [
      {
        path: AppRoutes.AUTH,
        element: (
          <GuestGuard>
            <AuthLayout />
          </GuestGuard>
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
          <AuthGuard>
            <PrivateLayout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={AppRoutePaths.PORTFOLIO()} />,
          },
          // {
          //   path: AppRoutes.DASHBOARD,
          //   element: <DashboardPage />,
          // },
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
            path: AppRoutes.ASSETS,
            element: <Navigate to={AppRoutePaths.ASSETS_STOCKS()} />,
          },
          {
            path: AppRoutes.ASSETS_STOCKS,
            element: <AssetsStocksPage />,
          },
          {
            path: AppRoutes.ASSETS_ETFS,
            element: <AssetsEtfsPage />,
          },
          {
            path: AppRoutes.ASSETS_ME,
            element: <UserAssetsPage />,
          },
          {
            path: AppRoutes.ASSETS_DETAILS,
            element: <AssetDetailsPage />,
          },
          {
            path: AppRoutes.ASSETS_OPERATIONS_CREATE,
            element: <UserAssetCreatePage />,
          },
          {
            path: '*',
            element: <Navigate to={AppRoutePaths.PORTFOLIO()} />,
          },
        ],
      },
    ],
  },
]);
