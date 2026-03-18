import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavShell } from '../components/NavShell';
import { NavSidebar } from '../components/NavSidebar';
import { NavGroup } from '../components/NavGroup';
import type { NavItemType } from '../types';

const navItems: NavItemType[] = [
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
    ],
  },
  { id: 'help', type: 'link', label: 'Help', href: '/help' },
];

function renderWithKeyboard(props: Partial<React.ComponentProps<typeof NavGroup>> = {}) {
  return render(
    <MantineProvider>
      <NavShell
        sidebar={
          <NavSidebar>
            <NavGroup
              items={navItems}
              enableKeyboardNav
              {...props}
            />
          </NavSidebar>
        }
      >
        <div>Main</div>
      </NavShell>
    </MantineProvider>,
  );
}

describe('Keyboard navigation integration', () => {
  it('renders tree with correct ARIA role', () => {
    renderWithKeyboard();
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('tree items have treeitem role', () => {
    renderWithKeyboard();
    const treeItems = screen.getAllByRole('treeitem');
    expect(treeItems.length).toBeGreaterThanOrEqual(4); // Home, Dashboard, Settings, Help
  });

  it('arrow keys move focus between items when a treeitem is focused', async () => {
    const user = userEvent.setup();
    renderWithKeyboard();

    // Focus the first treeitem directly
    const treeItems = screen.getAllByRole('treeitem');
    treeItems[0].focus();
    expect(treeItems[0]).toHaveFocus();

    // Arrow down moves to next item
    await user.keyboard('{ArrowDown}');
    expect(treeItems[1]).toHaveFocus();
  });

  it('arrow up moves focus backwards', async () => {
    const user = userEvent.setup();
    renderWithKeyboard();

    // Start on second item
    const treeItems = screen.getAllByRole('treeitem');
    treeItems[1].focus();

    await user.keyboard('{ArrowUp}');
    expect(treeItems[0]).toHaveFocus();
  });

  it('clicking a group item expands it to show children', async () => {
    const user = userEvent.setup();
    renderWithKeyboard();

    // Settings group starts collapsed
    const settingsGroup = screen.getByText('Settings');
    await user.click(settingsGroup);

    // Children should now be visible
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('expanded group shows children as treeitem elements', async () => {
    const user = userEvent.setup();
    renderWithKeyboard();

    await user.click(screen.getByText('Settings'));

    // Should now have more treeitems
    const treeItems = screen.getAllByRole('treeitem');
    // Home, Dashboard, Settings, General, Security, Help = 6
    expect(treeItems.length).toBeGreaterThanOrEqual(6);
  });

  it('clicking expanded group collapses it', async () => {
    const user = userEvent.setup();
    renderWithKeyboard();

    // Expand
    await user.click(screen.getByText('Settings'));
    expect(screen.getByText('General')).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByText('Settings'));

    // Children should be hidden (Mantine NavLink collapses)
    // In jsdom, collapsed children may still be in DOM but NavLink handles visibility
    const settingsTreeItem = screen.getByText('Settings').closest('[role="treeitem"]');
    expect(settingsTreeItem).toHaveAttribute('aria-expanded', 'false');
  });

  it('fires onItemClick when clicking a link item', async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    renderWithKeyboard({ onItemClick });

    await user.click(screen.getByText('Home'));

    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home', label: 'Home' }),
      expect.anything(),
    );
  });

  it('fires onGroupToggle when toggling a group', async () => {
    const user = userEvent.setup();
    const onGroupToggle = vi.fn();
    renderWithKeyboard({ onGroupToggle });

    await user.click(screen.getByText('Settings'));

    expect(onGroupToggle).toHaveBeenCalledTimes(1);
    expect(onGroupToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'settings', label: 'Settings' }),
      true, // opened
    );
  });

  it('active state highlights the correct item', () => {
    renderWithKeyboard({ currentPath: '/dashboard' });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('data-active', 'true');

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveAttribute('data-active', 'true');
  });
});
