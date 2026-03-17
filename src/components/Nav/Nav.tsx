'use client';

import type { ReactNode } from 'react';
import type { NavConfig, NavItemType } from '../../types';
import { NavGroup } from '../NavGroup';

export interface NavProps<TData = unknown> {
  config: NavConfig<TData>;
}

/**
 * Declarative config-driven API (Spec 043).
 * Renders a complete navigation from a config object.
 */
export function Nav<TData = unknown>({ config }: NavProps<TData>) {
  return (
    <NavGroup
      items={config.items}
      {...config.sidebar}
      animation={config.animation}
    />
  );
}

export interface NavLayoutProps {
  sidebar?: ReactNode;
  navbar?: ReactNode;
  children: ReactNode;
}

export function NavLayout({ sidebar, navbar, children }: NavLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {navbar && <div data-nav-navbar>{navbar}</div>}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {sidebar && <div data-nav-sidebar>{sidebar}</div>}
        <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
