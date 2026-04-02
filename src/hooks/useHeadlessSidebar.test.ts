import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeadlessSidebar } from './useHeadlessSidebar';
import type { NavItemType } from '../types';

const items: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/' },
  {
    type: 'group',
    id: 'settings',
    label: 'Settings',
    children: [
      { type: 'link', id: 'profile', label: 'Profile', href: '/profile' },
    ],
  },
];

describe('Spec 046: useHeadlessSidebar', () => {
  it('returns items and state', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    expect(result.current.items).toBe(items);
    expect(result.current.collapsed).toBe(false);
    expect(result.current.variant).toBe('full');
  });

  it('toggleGroup works', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    act(() => result.current.toggleGroup('settings'));
    expect(result.current.expandedKeys.has('settings')).toBe(true);
    act(() => result.current.toggleGroup('settings'));
    expect(result.current.expandedKeys.has('settings')).toBe(false);
  });

  it('setCollapsed and toggleCollapsed work', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    act(() => result.current.setCollapsed(true));
    expect(result.current.collapsed).toBe(true);
    act(() => result.current.toggleCollapsed());
    expect(result.current.collapsed).toBe(false);
  });

  it('setVariant works', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    act(() => result.current.setVariant('rail'));
    expect(result.current.variant).toBe('rail');
  });

  it('getRootProps returns tree role', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    const props = result.current.getRootProps();
    expect(props.role).toBe('tree');
    expect(props['aria-label']).toBe('Navigation');
  });

  it('getItemProps returns correct attributes', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    const linkProps = result.current.getItemProps(items[0]!);
    expect(linkProps.role).toBe('treeitem');

    const groupProps = result.current.getItemProps(items[1]!);
    expect(groupProps['aria-expanded']).toBe(false);
  });

  it('setActiveItem updates state', () => {
    const { result } = renderHook(() => useHeadlessSidebar({ items }));
    act(() => result.current.setActiveItem('home'));
    expect(result.current.activeItemId).toBe('home');
  });
});
