import { bindStyles, Icon, Popover, useOpenState } from '@devbonnysid/ui-kit-default';
import { SidebarLink } from '@widgets/sidebar';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FC, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, To, useLocation, useMatch } from 'react-router';

import styles from './SidebarMenuItem.module.scss';

type SidebarMenuItemButtonProps = SidebarLink &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SidebarLink> & {
    as?: 'button';
    subItems?: SidebarMenuItemProps[];
    isActive?: boolean;
    isChild?: boolean;
    isCollapsed?: boolean;
  };

type SidebarMenuItemLinkProps = SidebarLink &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SidebarLink> & {
    as: 'a';
    to: To;
    isChild?: boolean;
    isCollapsed?: boolean;
  };

export type SidebarMenuItemProps = SidebarMenuItemButtonProps | SidebarMenuItemLinkProps;

const cn = bindStyles(styles);

export const SidebarMenuItem: FC<SidebarMenuItemProps> = ({
  caption,
  icon,
  className,
  children,
  isChild,
  isCollapsed,
  ...props
}) => {
  const isRouteMatch = useMatch(typeof props.to === 'string' ? props.to : (props.to as any)?.pathname || '');
  const location = useLocation();
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyout = useOpenState();

  const hasActiveChild = useMemo(() => {
    if (!('subItems' in props) || !props.subItems?.length) return false;
    return props.subItems.some((item) => {
      const path = typeof item.to === 'string' ? item.to : (item.to as any)?.pathname || '';
      return location.pathname.startsWith(path);
    });
  }, [props, location.pathname]);

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  const renderedIcon = useMemo(() => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Icon type={icon} className={cn('icon')} />;
    }
    return icon;
  }, [icon]);

  const isActive = props.as === 'a' ? Boolean(isRouteMatch) : (props as SidebarMenuItemButtonProps).isActive;

  if (isChild) {
    if (isCollapsed) return null;
    return (
      <div className={cn('child-wrapper')}>
        <NavLink
          className={cn('child-content', { isActive: Boolean(isRouteMatch) })}
          {...(props as any)}
        >
          {renderedIcon}
          <span className={cn('caption')}>{caption || children}</span>
        </NavLink>
      </div>
    );
  }

  if ('subItems' in props && props.subItems?.length) {
    if (isCollapsed) {
      return (
        <>
          <button
            ref={triggerRef}
            type="button"
            className={cn('sidebar-menu-item', { isActive: hasActiveChild, isCollapsed })}
            onClick={flyout.toggle}
            title={String(caption)}
          >
            {renderedIcon}
          </button>
          {flyout.isOpen && (
            <Popover
              referenceRef={triggerRef}
              onClose={flyout.close}
              placement="right-start"
              gap={8}
              className={cn('flyout')}
              closeOnClickOutside
            >
              <div className={cn('flyout-title')}>{caption}</div>
              {props.subItems.map((item) => (
                // @ts-expect-error
                <SidebarMenuItem key={item.id} {...item} caption={t(item.caption)} as="a" />
              ))}
            </Popover>
          )}
        </>
      );
    }

    return (
      <div className={cn('expandable', { isActive: hasActiveChild })}>
        <button
          type="button"
          className={cn('sidebar-menu-item', 'expandable-trigger', { isActive: hasActiveChild || isOpen })}
          onClick={() => setIsOpen((v) => !v)}
        >
          <div className={cn('item-left')}>
            {renderedIcon}
            <span className={cn('caption')}>{caption || children}</span>
          </div>
          <Icon type="chevron" className={cn('chevron', { isOpen })} />
        </button>

        {isOpen && (
          <div className={cn('children')}>
            {props.subItems.map((item) => (
              // @ts-expect-error
              <SidebarMenuItem key={item.id} {...item} caption={t(item.caption)} as="a" isChild />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (props.as === 'a') {
    return (
      <NavLink
        className={cn(className, 'sidebar-menu-item', { isActive, isCollapsed })}
        title={isCollapsed ? String(caption) : undefined}
        {...(props as any)}
      >
        {renderedIcon}
        {!isCollapsed && <div className={cn('caption')}>{caption || children}</div>}
      </NavLink>
    );
  }

  return (
    <button
      {...(props as any)}
      type="button"
      className={cn(className, 'sidebar-menu-item', { isActive, isCollapsed })}
      title={isCollapsed ? String(caption) : undefined}
    >
      {renderedIcon}
      {!isCollapsed && <div className={cn('caption')}>{caption || children}</div>}
    </button>
  );
};
