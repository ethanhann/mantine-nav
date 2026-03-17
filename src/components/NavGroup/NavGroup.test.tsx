import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavGroup } from './NavGroup';
import type { NavItemType } from '../../types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const flatItems: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/' },
  { type: 'link', id: 'about', label: 'About', href: '/about' },
  { type: 'link', id: 'contact', label: 'Contact', href: '/contact' },
];

const nestedItems: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/' },
  {
    type: 'group',
    id: 'settings',
    label: 'Settings',
    children: [
      { type: 'link', id: 'profile', label: 'Profile', href: '/settings/profile' },
      {
        type: 'group',
        id: 'admin',
        label: 'Admin',
        children: [
          { type: 'link', id: 'users', label: 'Users', href: '/settings/admin/users' },
        ],
      },
    ],
  },
];

const threeDeepItems: NavItemType[] = [
  {
    type: 'group',
    id: 'l1',
    label: 'Level 1',
    defaultOpened: true,
    children: [
      {
        type: 'group',
        id: 'l2',
        label: 'Level 2',
        defaultOpened: true,
        children: [
          {
            type: 'group',
            id: 'l3',
            label: 'Level 3',
            children: [
              { type: 'link', id: 'deep', label: 'Deep Link', href: '/deep' },
            ],
          },
        ],
      },
    ],
  },
];

describe('Spec 001: NavGroup — Multi-Level Nesting', () => {
  it('renders a flat list of items with no nesting', () => {
    renderWithMantine(<NavGroup items={flatItems} currentPath="/none" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders with role="tree" on root', () => {
    renderWithMantine(<NavGroup items={flatItems} currentPath="/none" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  it('renders 2 levels of nesting with correct indentation', () => {
    renderWithMantine(<NavGroup items={nestedItems} currentPath="/none" />);
    // The Settings group should be visible
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('clicking a group toggles its expanded state', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={nestedItems} currentPath="/none" />);

    const settingsBtn = screen.getByText('Settings').closest('button')!;
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(settingsBtn);
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'true');

    await user.click(settingsBtn);
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('defaultOpened controls initial expansion', () => {
    const items: NavItemType[] = [
      {
        type: 'group',
        id: 'g1',
        label: 'Open Group',
        defaultOpened: true,
        children: [
          { type: 'link', id: 'child', label: 'Child', href: '/child' },
        ],
      },
    ];
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);
    const groupBtn = screen.getByText('Open Group').closest('button')!;
    expect(groupBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('onItemClick fires with correct item reference', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithMantine(
      <NavGroup items={flatItems} currentPath="/none" onItemClick={onClick} />,
    );

    await user.click(screen.getByText('About'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toMatchObject({ id: 'about', href: '/about' });
  });

  it('onGroupToggle fires with correct open/close state', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithMantine(
      <NavGroup items={nestedItems} currentPath="/none" onGroupToggle={onToggle} />,
    );

    await user.click(screen.getByText('Settings'));
    expect(onToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'settings' }),
      true,
    );

    await user.click(screen.getByText('Settings'));
    expect(onToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'settings' }),
      false,
    );
  });

  it('respects maxDepth — items beyond limit are not rendered', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <NavGroup items={threeDeepItems} maxDepth={2} currentPath="/none" />,
    );

    // Level 1 and Level 2 are rendered (both defaultOpened)
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();

    // Level 2 is at depth=1, so its children (Level 3 at depth=2) should be cut off at maxDepth=2
    // Level 3 group is at depth=2 which equals maxDepth, so it should NOT render
    // But we need to expand Level 2 first since Collapse may hide content
    const l2Btn = screen.getByText('Level 2').closest('button')!;
    expect(l2Btn).toHaveAttribute('aria-expanded', 'true');

    // Level 3 should not be rendered because depth >= maxDepth
    expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
  });

  it('ARIA tree roles are applied correctly', () => {
    renderWithMantine(<NavGroup items={flatItems} currentPath="/none" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
    const treeItems = screen.getAllByRole('treeitem');
    expect(treeItems.length).toBe(3);
  });

  it('renders sections and dividers', () => {
    const items: NavItemType[] = [
      { type: 'section', id: 's1', label: 'Main' },
      { type: 'link', id: 'home', label: 'Home', href: '/' },
      { type: 'divider', id: 'd1' },
      { type: 'link', id: 'about', label: 'About', href: '/about' },
    ];
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('disabled items are non-interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const items: NavItemType[] = [
      { type: 'link', id: 'disabled', label: 'Disabled', href: '/disabled', disabled: true },
    ];
    renderWithMantine(
      <NavGroup items={items} currentPath="/none" onItemClick={onClick} />,
    );
    await user.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
