import { AppRoutePaths } from '@shared/router';
import { SidebarLink } from '@widgets/sidebar';

export const SIDEBAR_LINKS: SidebarLink[] = [
  // {
  //   id: 'Dashboard',
  //   to: AppRoutePaths.DASHBOARD(),
  //   caption: 'Dashboard',
  //   icon: 'grid',
  // },
  {
    id: 'Portfolio',
    to: AppRoutePaths.PORTFOLIO(),
    caption: 'Portfolio',
    icon: 'folder',
  },
  {
    id: 'Assistant',
    to: AppRoutePaths.ASSISTANT(),
    caption: 'Assistant',
    icon: 'message',
  },
  {
    id: 'Transactions',
    to: AppRoutePaths.TRANSACTIONS(),
    caption: 'Transactions',
    icon: 'document',
  },
  {
    id: 'Assets',
    to: AppRoutePaths.ASSETS_STOCKS(),
    caption: 'Assets',
    icon: 'coins',
    subItems: [
      {
        id: 'MyAssets',
        caption: 'MyAssets',
        to: AppRoutePaths.ASSETS_ME(),
      },
      {
        id: 'Stocks',
        caption: 'Stocks',
        to: AppRoutePaths.ASSETS_STOCKS(),
      },
      {
        id: 'ETFs',
        caption: 'ETFs',
        to: AppRoutePaths.ASSETS_ETFS(),
      },
    ],
  },
] as const;
