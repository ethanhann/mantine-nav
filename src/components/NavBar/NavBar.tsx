'use client';

import { forwardRef, type ReactNode } from 'react';
import type { NavCSSVariable } from '../../types';
import classes from './NavBar.module.css';

export interface NavBarProps {
  logo?: ReactNode;
  children?: ReactNode;
  rightSection?: ReactNode;
  height?: number | string;
  sticky?: boolean;
  variant?: 'links' | 'tabs';
  vars?: Record<NavCSSVariable, string>;
}

export const NavBar = forwardRef<HTMLElement, NavBarProps>(function NavBar(
  { logo, children, rightSection, height, sticky = false, variant = 'links', vars },
  ref,
) {
  const cssVars = {
    ...(height ? { '--nav-navbar-height': typeof height === 'number' ? `${height}px` : height } : {}),
    ...vars,
  } as React.CSSProperties;

  return (
    <header
      className={classes.root}
      data-sticky={sticky || undefined}
      style={cssVars}
      ref={ref}
      role="banner"
    >
      {logo && <div className={classes.logo}>{logo}</div>}
      <nav className={variant === 'tabs' ? classes.tabs : classes.nav} role="menubar">
        {children}
      </nav>
      {rightSection && <div className={classes.rightSection}>{rightSection}</div>}
    </header>
  );
});

// NavBar sub-components

export interface NavBreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
  separator?: ReactNode;
  maxItems?: number;
}

export function NavBreadcrumbs({ items, separator = '/', maxItems }: NavBreadcrumbsProps) {
  const displayItems = maxItems && items.length > maxItems
    ? [items[0]!, { label: '...', href: undefined }, ...items.slice(-(maxItems - 1))]
    : items;

  return (
    <nav className={classes.breadcrumbs} aria-label="Breadcrumb">
      {displayItems.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className={classes.breadcrumbSeparator} aria-hidden="true">{separator}</span>}
          {item.href && i < displayItems.length - 1 ? (
            <a className={classes.breadcrumbLink} href={item.href}>{item.label}</a>
          ) : (
            <span className={classes.breadcrumbCurrent} aria-current={i === displayItems.length - 1 ? 'page' : undefined}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export interface EnvironmentIndicatorProps {
  environment: string;
  color?: string;
  variant?: 'badge' | 'strip';
}

export function EnvironmentIndicator({
  environment,
  color = '#ef4444',
  variant = 'badge',
}: EnvironmentIndicatorProps) {
  if (variant === 'strip') {
    return <div className={classes.envStrip} style={{ backgroundColor: color }} aria-label={`Environment: ${environment}`} />;
  }

  return (
    <span className={classes.envIndicator} style={{ backgroundColor: `${color}20`, color }} role="status">
      {environment}
    </span>
  );
}

export interface CommandPaletteSlotProps {
  shortcut?: string;
  placeholder?: string;
  onTrigger?: () => void;
  variant?: 'input' | 'button' | 'icon';
}

export function CommandPaletteSlot({
  shortcut = '⌘K',
  placeholder = 'Search...',
  onTrigger,
  variant = 'button',
}: CommandPaletteSlotProps) {
  return (
    <button
      className={classes.navLink}
      type="button"
      onClick={onTrigger}
      aria-label={`${placeholder} (${shortcut})`}
    >
      {variant === 'input' ? (
        <span style={{ opacity: 0.6 }}>{placeholder}</span>
      ) : (
        <span>🔍</span>
      )}
      <kbd style={{ marginInlineStart: 8, opacity: 0.5, fontSize: '0.75em' }}>{shortcut}</kbd>
    </button>
  );
}
