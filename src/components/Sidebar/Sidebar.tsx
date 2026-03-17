'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ScrollArea, Tooltip, type ScrollAreaProps } from '@mantine/core';
import type { NavCSSVariable } from '../../types';
import classes from './Sidebar.module.css';

export interface SidebarRef {
  collapse: () => void;
  expand: () => void;
  toggle: () => void;
  scrollTo: (position: number) => void;
}

export interface SidebarProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsible?: boolean;
  expandedWidth?: number | string;
  collapsedWidth?: number | string;
  showCollapseToggle?: boolean;
  collapseTogglePosition?: 'header' | 'footer';
  collapseToggleLabel?: string;
  scrollAreaProps?: ScrollAreaProps;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  headerBorderBottom?: boolean;
  footerBorderTop?: boolean;
  vars?: Record<NavCSSVariable, string>;
}

export const Sidebar = forwardRef<SidebarRef, SidebarProps>(function Sidebar(
  {
    children,
    header,
    footer,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    collapsible = true,
    expandedWidth = 260,
    collapsedWidth = 60,
    showCollapseToggle = true,
    collapseTogglePosition = 'footer',
    collapseToggleLabel = 'Toggle sidebar',
    scrollAreaProps,
    stickyHeader = true,
    stickyFooter = true,
    headerBorderBottom = true,
    footerBorderTop = true,
    vars,
  },
  ref,
) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(value);
      }
      onCollapsedChange?.(value);
    },
    [controlledCollapsed, onCollapsedChange],
  );

  const toggle = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);
  const collapse = useCallback(() => setCollapsed(true), [setCollapsed]);
  const expand = useCallback(() => setCollapsed(false), [setCollapsed]);

  const scrollTo = useCallback((position: number) => {
    scrollViewportRef.current?.scrollTo({ top: position, behavior: 'smooth' });
  }, []);

  useImperativeHandle(ref, () => ({
    collapse,
    expand,
    toggle,
    scrollTo,
  }));

  const handleScroll = useCallback((pos: { x: number; y: number }) => {
    setIsScrolled(pos.y > 0);
  }, []);

  const cssVars = {
    '--nav-sidebar-width': typeof expandedWidth === 'number' ? `${expandedWidth}px` : expandedWidth,
    '--nav-sidebar-collapsed-width': typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth,
    ...vars,
  } as React.CSSProperties;

  const collapseToggleEl = collapsible && showCollapseToggle ? (
    <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position="right" disabled={!collapsed}>
      <button
        className={classes.collapseToggle}
        type="button"
        onClick={toggle}
        aria-label={collapseToggleLabel}
        aria-expanded={!collapsed}
      >
        <span
          className={classes.collapseIcon}
          data-collapsed={collapsed || undefined}
          aria-hidden="true"
        >
          ◂
        </span>
      </button>
    </Tooltip>
  ) : null;

  return (
    <nav
      className={classes.root}
      data-collapsed={collapsed || undefined}
      style={cssVars}
      aria-label="Sidebar navigation"
    >
      {(header || (collapseTogglePosition === 'header' && collapseToggleEl)) && (
        <div
          className={classes.header}
          data-border={headerBorderBottom || undefined}
          data-scrolled={isScrolled || undefined}
          style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 1 } : undefined}
        >
          {header}
          {collapseTogglePosition === 'header' && collapseToggleEl}
        </div>
      )}

      <ScrollArea
        className={classes.content}
        onScrollPositionChange={handleScroll}
        viewportRef={scrollViewportRef}
        {...scrollAreaProps}
      >
        {children}
      </ScrollArea>

      {(footer || (collapseTogglePosition === 'footer' && collapseToggleEl)) && (
        <div
          className={classes.footer}
          data-border={footerBorderTop || undefined}
          style={stickyFooter ? { position: 'sticky', bottom: 0, zIndex: 1 } : undefined}
        >
          {footer}
          {collapseTogglePosition === 'footer' && collapseToggleEl}
        </div>
      )}
    </nav>
  );
});
