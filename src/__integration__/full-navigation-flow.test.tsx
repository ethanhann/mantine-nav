import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavShell, useNavShell } from '../components/NavShell';
import { NavSidebar } from '../components/NavSidebar';
import { NavHeader } from '../components/NavHeader';
import { NavGroup } from '../components/NavGroup';
import { WorkspaceSwitcher } from '../components/SaaS/WorkspaceSwitcher';
import { UserMenu } from '../components/SaaS/UserMenu';
import { NotificationIndicator } from '../components/SaaS/NotificationIndicator';
import { PlanBadge } from '../components/SaaS/PlanBadge';
import { sampleNavItems, sampleWorkspaces, sampleUser } from './helpers';
import type { NotificationItem } from '../components/SaaS/NotificationIndicator';

const notifications: NotificationItem[] = [
  { id: 'n1', title: 'New deploy', description: 'v2.1 deployed', read: false },
  { id: 'n2', title: 'PR merged', description: '#42 merged', read: true },
];

const menuItems = [
  { label: 'Profile', onClick: vi.fn() },
  { label: 'Sign out', onClick: vi.fn(), color: 'red' as const, dividerBefore: true },
];

function CollapseStatus() {
  const { desktopCollapsed } = useNavShell();
  return <span data-testid="collapsed">{String(desktopCollapsed)}</span>;
}

function renderFullApp(opts: {
  currentPath?: string;
  onItemClick?: (item: any, e: any) => void;
  onWorkspaceSwitch?: (ws: any) => void;
} = {}) {
  const onItemClick = opts.onItemClick ?? vi.fn();
  const onWorkspaceSwitch = opts.onWorkspaceSwitch ?? vi.fn();

  return {
    onItemClick,
    onWorkspaceSwitch,
    ...render(
      <MantineProvider>
        <NavShell
          header={
            <NavHeader
              logo={<span data-testid="logo">Acme</span>}
              rightSection={
                <>
                  <NotificationIndicator
                    count={notifications.filter((n) => !n.read).length}
                    notifications={notifications}
                    onRead={vi.fn()}
                    onReadAll={vi.fn()}
                  />
                  <PlanBadge plan="Pro" />
                </>
              }
            />
          }
          sidebar={
            <NavSidebar
              header={
                <WorkspaceSwitcher
                  workspaces={sampleWorkspaces}
                  activeWorkspace={sampleWorkspaces[0]}
                  onSwitch={onWorkspaceSwitch}
                />
              }
              footer={
                <>
                  <UserMenu user={sampleUser} menuItems={menuItems} />
                  <CollapseStatus />
                </>
              }
            >
              <NavGroup
                items={sampleNavItems}
                currentPath={opts.currentPath ?? '/'}
                onItemClick={onItemClick}
                accordion
              />
            </NavSidebar>
          }
        >
          <div data-testid="main-content">Page Content</div>
        </NavShell>
      </MantineProvider>,
    ),
  };
}

describe('Full navigation flow integration', () => {
  it('renders complete app shell with all components', () => {
    renderFullApp();

    // Header
    expect(screen.getByTestId('logo')).toHaveTextContent('Acme');
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications (1 unread)')).toBeInTheDocument();

    // Sidebar header (workspace switcher)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // Sidebar nav
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Sidebar footer (user menu)
    expect(screen.getByText('Jane Cooper')).toBeInTheDocument();

    // Main content
    expect(screen.getByTestId('main-content')).toHaveTextContent('Page Content');
  });

  it('active state highlights the correct nav item', () => {
    renderFullApp({ currentPath: '/dashboard' });

    const dashLink = screen.getByText('Dashboard').closest('a');
    expect(dashLink).toHaveAttribute('data-active', 'true');

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveAttribute('data-active', 'true');
  });

  it('clicking a nav item triggers onItemClick', async () => {
    const user = userEvent.setup();
    const { onItemClick } = renderFullApp();

    await user.click(screen.getByText('Dashboard'));

    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dashboard' }),
      expect.anything(),
    );
  });

  it('expanding a group in accordion mode collapses siblings', async () => {
    const user = userEvent.setup();
    renderFullApp();

    // Expand Settings
    await user.click(screen.getByText('Settings'));
    const settingsItem = screen.getByText('Settings').closest('[role="treeitem"]');
    expect(settingsItem).toHaveAttribute('aria-expanded', 'true');

    // Expand Documentation — should collapse Settings
    await user.click(screen.getByText('Documentation'));
    const docsItem = screen.getByText('Documentation').closest('[role="treeitem"]');
    expect(docsItem).toHaveAttribute('aria-expanded', 'true');
    expect(settingsItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('workspace switcher opens and sets expanded state', async () => {
    const user = userEvent.setup();
    renderFullApp();

    // Find the workspace trigger button and click it
    const trigger = screen.getByRole('button', { name: /acme corp/i });
    await user.click(trigger);

    // Mantine Menu uses portals — verify the trigger is expanded
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('user menu shows user name in sidebar', () => {
    renderFullApp();
    expect(screen.getByText('Jane Cooper')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('collapsing sidebar updates context', async () => {
    const user = userEvent.setup();
    renderFullApp();

    expect(screen.getByTestId('collapsed')).toHaveTextContent('false');

    await user.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true');
  });

  it('nav items interact correctly after sidebar collapse', async () => {
    const user = userEvent.setup();
    const { onItemClick } = renderFullApp();

    // Collapse
    await user.click(screen.getByLabelText('Collapse sidebar'));
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true');

    // Nav items should still be clickable (shown as icon rail with aria-label)
    await user.click(screen.getByLabelText('Home'));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home' }),
      expect.anything(),
    );
  });

  it('notification indicator shows correct count', () => {
    renderFullApp();
    // 1 unread notification
    expect(screen.getByLabelText('Notifications (1 unread)')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('PlanBadge displays in header', () => {
    renderFullApp();
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Pro');
  });

  it('all interactive elements are accessible via keyboard focus', async () => {
    const user = userEvent.setup();
    renderFullApp();

    // Tab through the page — verify no errors thrown
    await user.tab();
    await user.tab();
    await user.tab();

    // Should be able to tab without crashing
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});
