import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { NavShell, type NavShellProps } from '../components/NavShell';
import { NavSidebar } from '../components/NavSidebar';
import { NavHeader } from '../components/NavHeader';
import { NavGroup, type NavGroupProps } from '../components/NavGroup';
import type { NavItemType, Workspace, UserInfo } from '../types';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

export const sampleNavItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/' },
  { id: 'dashboard', type: 'link', label: 'Dashboard', href: '/dashboard' },
  {
    id: 'settings',
    type: 'group',
    label: 'Settings',
    defaultOpened: false,
    children: [
      { id: 'general', type: 'link', label: 'General', href: '/settings/general' },
      { id: 'security', type: 'link', label: 'Security', href: '/settings/security' },
      { id: 'billing', type: 'link', label: 'Billing', href: '/settings/billing' },
    ],
  },
  {
    id: 'docs',
    type: 'group',
    label: 'Documentation',
    defaultOpened: false,
    children: [
      { id: 'getting-started', type: 'link', label: 'Getting Started', href: '/docs/getting-started' },
      { id: 'api-ref', type: 'link', label: 'API Reference', href: '/docs/api' },
    ],
  },
];

export const sampleWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Acme Corp' },
  { id: 'ws-2', name: 'Side Project' },
  { id: 'ws-3', name: 'Client Work' },
];

export const sampleUser: UserInfo = {
  id: 'u-1',
  name: 'Jane Cooper',
  email: 'jane@acme.com',
  role: 'Admin',
};

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

interface RenderNavAppOptions {
  shellProps?: Partial<NavShellProps>;
  navGroupProps?: Partial<NavGroupProps>;
  headerContent?: ReactElement;
  sidebarHeader?: ReactElement;
  sidebarFooter?: ReactElement;
  renderOptions?: Omit<RenderOptions, 'wrapper'>;
}

/**
 * Renders a full NavShell + NavSidebar + NavHeader + NavGroup composition
 * wrapped in MantineProvider. Returns the standard testing-library result.
 */
export function renderNavApp(options: RenderNavAppOptions = {}) {
  const {
    shellProps = {},
    navGroupProps = {},
    headerContent,
    sidebarHeader,
    sidebarFooter,
    renderOptions = {},
  } = options;

  const items = navGroupProps.items ?? sampleNavItems;

  const sidebar = (
    <NavSidebar
      header={sidebarHeader}
      footer={sidebarFooter}
    >
      <NavGroup items={items} {...navGroupProps} />
    </NavSidebar>
  );

  const header = (
    <NavHeader logo={<span data-testid="logo">Nav</span>}>
      {headerContent}
    </NavHeader>
  );

  return render(
    <MantineProvider>
      <NavShell
        header={header}
        sidebar={sidebar}
        {...shellProps}
      >
        <div data-testid="main-content">Main Content</div>
      </NavShell>
    </MantineProvider>,
    renderOptions,
  );
}

// ---------------------------------------------------------------------------
// matchMedia helper
// ---------------------------------------------------------------------------

/**
 * Mocks window.matchMedia to simulate a specific viewport width.
 * Call this before rendering to control responsive behavior.
 */
export function mockViewport(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => {
      // Parse simple (max-width: Xem) queries
      const match = query.match(/\(max-width:\s*([\d.]+)em\)/);
      const maxWidthPx = match ? parseFloat(match[1]!) * 16 : Infinity;
      const matches = width <= maxWidthPx;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    },
  });
}

/**
 * Resets matchMedia to the default (non-matching) mock from test-setup.ts.
 */
export function resetViewport() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
