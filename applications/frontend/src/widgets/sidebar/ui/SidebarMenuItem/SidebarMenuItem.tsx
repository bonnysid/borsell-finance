import { Accordion, bindStyles, Icon, IconTypes } from '@devbonnysid/ui-kit-default';
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FC,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import { NavLink, To } from 'react-router-dom';

import styles from './SidebarMenuItem.module.scss';

export type SidebarMenuItemType = {
  id: string;
  caption: ReactNode;
  icon?: ReactElement | IconTypes;
};

type SidebarMenuItemButtonProps = SidebarMenuItemType &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SidebarMenuItemType> & {
    as?: 'button';
    subItems?: SidebarMenuItemProps[];
  };

type SidebarMenuItemLinkProps = SidebarMenuItemType &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SidebarMenuItemType> & {
    as: 'a';
    to: To;
  };

export type SidebarMenuItemProps = SidebarMenuItemButtonProps | SidebarMenuItemLinkProps;

const cn = bindStyles(styles);

export const SidebarMenuItem: FC<SidebarMenuItemProps> = ({
  caption,
  icon,
  className,
  children,
  ...props
}) => {
  const classnames = cn(className, 'sidebar-menu-item');

  const renderedIcon = useMemo(() => {
    if (typeof icon === 'string') {
      return <Icon type={icon} className={cn('icon')} />;
    }

    return icon;
  }, [icon]);

  const content = (
    <>
      {renderedIcon}
      <div className={cn('caption')}>{caption || children}</div>
    </>
  );

  if (props.as === 'a') {
    return (
      <NavLink className={classnames} {...props}>
        {content}
      </NavLink>
    );
  }

  if (props.subItems?.length) {
    return (
      <Accordion header={<div className={classnames}>{content}</div>}>
        {props.subItems.map((item) => {
          return <SidebarMenuItem key={item.id} {...item} />;
        })}
      </Accordion>
    );
  }

  return (
    <button {...props} type="button" className={classnames}>
      {content}
    </button>
  );
};
