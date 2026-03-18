import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useActiveNavItem } from './useActiveNavItem';
import type { NavItemType } from '../types';

const items: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/', activeExact: true },
  { type: 'link', id: 'settings', label: 'Settings', href: '/settings' },
  {
    type: 'group',
    id: 'admin',
    label: 'Admin',
    children: [
      { type: 'link', id: 'users', label: 'Users', href: '/admin/users' },
      { type: 'link', id: 'roles', label: 'Roles', href: '/admin/roles' },
    ],
  },
  { type: 'link', id: 'settings-old', label: 'Old Settings', href: '/settings-old' },
];

describe('Spec 005: useActiveNavItem', () => {
  it('exact matching: only /settings matches /settings', () => {
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/settings', matcher: 'exact' }),
    );
    expect(result.current.activeItem?.id).toBe('settings');
    expect(result.current.activeHref).toBe('/settings');
  });

  it('prefix matching: /settings matches /settings/team but not /settings-old', () => {
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/settings/team', matcher: 'prefix' }),
    );
    expect(result.current.activeItem?.id).toBe('settings');

    const { result: result2 } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/settings-old', matcher: 'prefix' }),
    );
    expect(result2.current.activeItem?.id).toBe('settings-old');
  });

  it('most specific match wins when multiple items match', () => {
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/admin/users', matcher: 'prefix' }),
    );
    expect(result.current.activeItem?.id).toBe('users');
  });

  it('custom function matcher is called correctly', () => {
    const customMatcher = (current: string, href: string) =>
      current.endsWith(href.split('/').pop()!);

    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/anything/users', matcher: customMatcher }),
    );
    // /anything/users ends with 'users', matches /admin/users (href ends with 'users')
    expect(result.current.activeItem).not.toBeNull();
  });

  it('regex matching works with custom patterns', () => {
    const regexItems: NavItemType[] = [
      { type: 'link', id: 'r1', label: 'Projects', href: '/projects', activeMatch: /^\/projects(\/.*)?$/ },
    ];
    const { result } = renderHook(() =>
      useActiveNavItem(regexItems, { currentPath: '/projects/123' }),
    );
    expect(result.current.activeItem?.id).toBe('r1');
  });

  it('parent groups are active when child is active', () => {
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/admin/users', matcher: 'prefix' }),
    );
    const adminGroup = items[2]!;
    expect(result.current.isActive(adminGroup)).toBe(true);
  });

  it('returns null when no match', () => {
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/unknown' }),
    );
    expect(result.current.activeItem).toBeNull();
    expect(result.current.activeHref).toBeNull();
  });

  it('activeExact on individual item overrides default matcher', () => {
    // Home has activeExact=true, so prefix matching should still be exact for it
    const { result } = renderHook(() =>
      useActiveNavItem(items, { currentPath: '/home-page', matcher: 'prefix' }),
    );
    // '/' with activeExact should NOT match '/home-page'
    const homeItem = items[0]!;
    expect(result.current.isActive(homeItem)).toBe(false);
  });
});
