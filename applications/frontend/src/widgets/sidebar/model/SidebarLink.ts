import { IconTypes } from '@devbonnysid/ui-kit-default';
import { ResourceKeysType } from '@shared/i18n/types/resources';
import { ReactElement } from 'react';
import { To } from 'react-router';

export type SidebarLink = {
  id: string;
  to: To;
  caption: ResourceKeysType;
  icon?: ReactElement | IconTypes;
  subItems?: SidebarLink[];
};
