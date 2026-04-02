import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRemoteNavItems } from './useRemoteNavItems';
import type { RemoteNavItem } from './useRemoteNavItems';
import type { NavGroupItem, NavLinkItem } from '../types';

describe('useRemoteNavItems', () => {
  it('returns loading state when items are null', () => {
    const { result } = renderHook(() =>
      useRemoteNavItems({ items: null }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('returns loading state when items are undefined', () => {
    const { result } = renderHook(() =>
      useRemoteNavItems({ items: undefined }),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
  });

  it('hydrates flat link items', () => {
    const raw: RemoteNavItem[] = [
      { id: 'home', type: 'link', label: 'Home', href: '/' },
      { id: 'about', type: 'link', label: 'About', href: '/about', external: true },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({ items: raw }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0]).toMatchObject({
      id: 'home', type: 'link', label: 'Home', href: '/',
    });
    expect(result.current.items[1]).toMatchObject({
      id: 'about', type: 'link', external: true,
    });
  });

  it('resolves icon strings to React nodes', () => {
    const HomeIcon = React.createElement('svg', { 'data-icon': 'home' });
    const raw: RemoteNavItem[] = [
      { id: 'home', type: 'link', label: 'Home', href: '/', icon: 'home' },
      { id: 'about', type: 'link', label: 'About', href: '/about', icon: 'missing' },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({
        items: raw,
        resolvers: { icons: { home: HomeIcon } },
      }),
    );

    const home = result.current.items[0] as NavLinkItem;
    expect(home.icon).toBe(HomeIcon);

    const about = result.current.items[1] as NavLinkItem;
    expect(about.icon).toBeUndefined();
  });

  it('resolves badge strings to React nodes', () => {
    const NewBadge = React.createElement('span', null, 'New');
    const raw: RemoteNavItem[] = [
      { id: 'home', type: 'link', label: 'Home', href: '/', badge: 'new' },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({
        items: raw,
        resolvers: { badges: { new: NewBadge } },
      }),
    );

    const home = result.current.items[0] as NavLinkItem;
    expect(home.badge).toBe(NewBadge);
  });

  it('resolves onClick handlers by item ID', () => {
    const handleClick = vi.fn();
    const raw: RemoteNavItem[] = [
      { id: 'feedback', type: 'link', label: 'Feedback', href: '#' },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({
        items: raw,
        resolvers: { onClick: { feedback: handleClick } },
      }),
    );

    const feedback = result.current.items[0] as NavLinkItem;
    expect(feedback.onClick).toBe(handleClick);
  });

  it('resolves visibility overrides by item ID', () => {
    const raw: RemoteNavItem[] = [
      { id: 'admin', type: 'link', label: 'Admin', href: '/admin', visible: true },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({
        items: raw,
        resolvers: { visible: { admin: false } },
      }),
    );

    expect(result.current.items[0].visible).toBe(false);
  });

  it('hydrates nested group items recursively', () => {
    const raw: RemoteNavItem[] = [
      {
        id: 'products',
        type: 'group',
        label: 'Products',
        icon: 'package',
        children: [
          { id: 'catalog', type: 'link', label: 'Catalog', href: '/catalog', icon: 'list' },
          { id: 'inventory', type: 'link', label: 'Inventory', href: '/inventory' },
        ],
      },
    ];

    const PackageIcon = React.createElement('svg', { 'data-icon': 'package' });
    const ListIcon = React.createElement('svg', { 'data-icon': 'list' });

    const { result } = renderHook(() =>
      useRemoteNavItems({
        items: raw,
        resolvers: { icons: { package: PackageIcon, list: ListIcon } },
      }),
    );

    const group = result.current.items[0] as NavGroupItem;
    expect(group.type).toBe('group');
    expect(group.icon).toBe(PackageIcon);
    expect(group.children).toHaveLength(2);

    const catalog = group.children[0] as NavLinkItem;
    expect(catalog.icon).toBe(ListIcon);

    const inventory = group.children[1] as NavLinkItem;
    expect(inventory.icon).toBeUndefined();
  });

  it('hydrates dividers and section headers', () => {
    const raw: RemoteNavItem[] = [
      { id: 'sec', type: 'section', label: 'Main' },
      { id: 'home', type: 'link', label: 'Home', href: '/' },
      { id: 'div', type: 'divider' },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({ items: raw }),
    );

    expect(result.current.items[0]).toMatchObject({ type: 'section', label: 'Main' });
    expect(result.current.items[2]).toMatchObject({ type: 'divider' });
  });

  it('preserves weight and data fields', () => {
    const raw: RemoteNavItem[] = [
      { id: 'a', type: 'link', label: 'A', href: '/a', weight: 10, data: { role: 'admin' } },
    ];

    const { result } = renderHook(() =>
      useRemoteNavItems({ items: raw }),
    );

    expect(result.current.items[0].weight).toBe(10);
    expect((result.current.items[0] as NavLinkItem).data).toEqual({ role: 'admin' });
  });
});
