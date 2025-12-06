import { IconTypes } from '@devbonnysid/ui-kit-default';
import { ReactElement } from 'react';
import { To } from 'react-router';

export type SidebarLink = {
  id: string;
  to: To;
  caption: string;
  icon?: ReactElement | IconTypes;
  subItems?: SidebarLink[];
};
