import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { NavGroup } from './NavGroup';
import type { NavItemType } from '../../types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const items: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/' },
  {
    type: 'group',
    id: 'settings',
    label: 'Settings',
    children: [
      { type: 'link', id: 'profile', label: 'Profile', href: '/profile' },
      { type: 'link', id: 'account', label: 'Account', href: '/account' },
    ],
  },
  { type: 'link', id: 'about', label: 'About', href: '/about' },
];

describe('Spec 006: Keyboard Navigation', () => {
  it('ArrowDown/Up moves focus through visible items', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);

    const tree = screen.getByRole('tree');
    const treeItems = screen.getAllByRole('treeitem');

    // Focus the first item
    treeItems[0]!.focus();
    expect(document.activeElement).toBe(treeItems[0]);

    await user.keyboard('{ArrowDown}');
    // Now focus should be on next item (Settings group)
    expect(document.activeElement).toBe(treeItems[1]);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(treeItems[0]);
  });

  it('ArrowRight expands collapsed group', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);

    const settingsBtn = screen.getByText('Settings').closest('button')!;
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'false');

    settingsBtn.focus();
    await user.keyboard('{ArrowRight}');
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowLeft collapses expanded group', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);

    const settingsBtn = screen.getByText('Settings').closest('button')!;
    settingsBtn.focus();

    // First expand
    await user.keyboard('{ArrowRight}');
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'true');

    // Then collapse
    await user.keyboard('{ArrowLeft}');
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('Home/End jump to first/last item', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);

    const treeItems = screen.getAllByRole('treeitem');
    treeItems[1]!.focus(); // Focus middle item

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(treeItems[0]);

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(treeItems[treeItems.length - 1]);
  });

  it('Enter/Space toggles group', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" />);

    const settingsBtn = screen.getByText('Settings').closest('button')!;
    settingsBtn.focus();

    await user.keyboard('{Enter}');
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(settingsBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('focus wraps when loopNavigation=true', async () => {
    const user = userEvent.setup();
    renderWithMantine(<NavGroup items={items} currentPath="/none" loopNavigation />);

    const treeItems = screen.getAllByRole('treeitem');
    // Focus last item
    treeItems[treeItems.length - 1]!.focus();

    await user.keyboard('{ArrowDown}');
    // Should wrap to first
    expect(document.activeElement).toBe(treeItems[0]);
  });
});
