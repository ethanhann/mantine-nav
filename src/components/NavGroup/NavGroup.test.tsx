import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavGroup } from './NavGroup';
import { NavShell } from '../NavShell';
import type { NavItemType } from '../../types';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MantineProvider>{children}</MantineProvider>;
}

const flatItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/' },
  { id: 'about', type: 'link', label: 'About', href: '/about' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings' },
];

const nestedItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/' },
  {
    id: 'products',
    type: 'group',
    label: 'Products',
    defaultOpened: true,
    children: [
      { id: 'catalog', type: 'link', label: 'Catalog', href: '/products' },
      { id: 'inventory', type: 'link', label: 'Inventory', href: '/products/inventory' },
    ],
  },
];

describe('NavGroup (Mantine NavLink)', () => {
  it('renders flat list of items', () => {
    render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders nested items', () => {
    render(<NavGroup items={nestedItems} />, { wrapper: Wrapper });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('marks active item via currentPath', () => {
    render(<NavGroup items={flatItems} currentPath="/about" />, { wrapper: Wrapper });
    const aboutLink = screen.getByText('About').closest('a');
    expect(aboutLink).toHaveAttribute('data-active', 'true');
  });

  it('renders dividers', () => {
    const items: NavItemType[] = [
      { id: 'a', type: 'link', label: 'A', href: '/a' },
      { id: 'div', type: 'divider' },
      { id: 'b', type: 'link', label: 'B', href: '/b' },
    ];
    render(<NavGroup items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders section headers', () => {
    const items: NavItemType[] = [
      { id: 'sec', type: 'section', label: 'Main' },
      { id: 'a', type: 'link', label: 'A', href: '/a' },
    ];
    render(<NavGroup items={items} />, { wrapper: Wrapper });
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('fires onItemClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavGroup items={flatItems} onItemClick={onClick} />, { wrapper: Wrapper });
    await user.click(screen.getByText('Home'));
    expect(onClick).toHaveBeenCalled();
  });

  it('has tree ARIA role', () => {
    render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
    expect(screen.getByRole('tree')).toBeInTheDocument();
  });

  describe('visibility', () => {
    it('hides item with visible: false', () => {
      const items: NavItemType[] = [
        { id: 'a', type: 'link', label: 'Visible', href: '/a' },
        { id: 'b', type: 'link', label: 'Hidden', href: '/b', visible: false },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('hides item with visible callback returning false', () => {
      const items: NavItemType[] = [
        { id: 'a', type: 'link', label: 'Visible', href: '/a' },
        { id: 'b', type: 'link', label: 'Hidden', href: '/b', visible: () => false },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('renders items without visible property normally', () => {
      render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('hides group with visible: false and its children', () => {
      const items: NavItemType[] = [
        { id: 'home', type: 'link', label: 'Home', href: '/' },
        {
          id: 'group',
          type: 'group',
          label: 'Admin',
          visible: false,
          children: [
            { id: 'users', type: 'link', label: 'Users', href: '/users' },
          ],
        },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('auto-hides group when all children are invisible', () => {
      const items: NavItemType[] = [
        {
          id: 'group',
          type: 'group',
          label: 'Empty Group',
          defaultOpened: true,
          children: [
            { id: 'a', type: 'link', label: 'A', href: '/a', visible: false },
            { id: 'b', type: 'link', label: 'B', href: '/b', visible: false },
          ],
        },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      expect(screen.queryByText('Empty Group')).not.toBeInTheDocument();
    });

    it('keeps group when at least one child is visible', () => {
      const items: NavItemType[] = [
        {
          id: 'group',
          type: 'group',
          label: 'Partial',
          defaultOpened: true,
          children: [
            { id: 'a', type: 'link', label: 'Hidden Child', href: '/a', visible: false },
            { id: 'b', type: 'link', label: 'Visible Child', href: '/b' },
          ],
        },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      expect(screen.getByText('Partial')).toBeInTheDocument();
      expect(screen.queryByText('Hidden Child')).not.toBeInTheDocument();
      expect(screen.getByText('Visible Child')).toBeInTheDocument();
    });
  });

  describe('external and onClick', () => {
    it('renders external link with target and rel attributes', () => {
      const items: NavItemType[] = [
        { id: 'ext', type: 'link', label: 'External', href: 'https://example.com', external: true },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      const link = screen.getByText('External').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('external link bypasses linkComponent from context', () => {
      const FakeLink = React.forwardRef<HTMLAnchorElement, any>((props, ref) => (
        <a ref={ref} data-router-link {...props} />
      ));
      FakeLink.displayName = 'FakeLink';

      const items: NavItemType[] = [
        { id: 'ext', type: 'link', label: 'External', href: 'https://example.com', external: true },
      ];
      render(
        <NavShell linkComponent={FakeLink} sidebar={<NavGroup items={items} />}>
          <div>Content</div>
        </NavShell>,
        { wrapper: Wrapper },
      );
      const link = screen.getByText('External').closest('a');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).not.toHaveAttribute('data-router-link');
    });

    it('fires item onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const items: NavItemType[] = [
        { id: 'action', type: 'link', label: 'Action', href: '#', onClick: handleClick },
      ];
      render(<NavGroup items={items} />, { wrapper: Wrapper });
      await user.click(screen.getByText('Action'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('item onClick does not suppress onItemClick callback', async () => {
      const user = userEvent.setup();
      const itemOnClick = vi.fn();
      const groupOnItemClick = vi.fn();
      const items: NavItemType[] = [
        { id: 'action', type: 'link', label: 'Action', href: '#', onClick: itemOnClick },
      ];
      render(<NavGroup items={items} onItemClick={groupOnItemClick} />, { wrapper: Wrapper });
      await user.click(screen.getByText('Action'));
      expect(itemOnClick).toHaveBeenCalled();
      expect(groupOnItemClick).toHaveBeenCalled();
    });
  });
});
