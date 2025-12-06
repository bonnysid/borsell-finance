import { Accordion, bindStyles, Icon } from '@devbonnysid/ui-kit-default';
import { SidebarLink } from '@widgets/sidebar';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FC, useMemo } from 'react';
import { NavLink, To, useMatch } from 'react-router';

import styles from './SidebarMenuItem.module.scss';

type SidebarMenuItemButtonProps = SidebarLink &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SidebarLink> & {
    as?: 'button';
    subItems?: SidebarMenuItemProps[];
    isActive?: boolean;
  };

type SidebarMenuItemLinkProps = SidebarLink &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SidebarLink> & {
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
  const isRouteMatch = useMatch(typeof props.to === 'string' ? props.to : props.to.pathname || '');
  const classnames = cn(className, 'sidebar-menu-item', {
    isActive: props.as === 'a' ? Boolean(isRouteMatch) : props.isActive,
  });

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
