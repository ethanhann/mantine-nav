import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePinnedItems } from './usePinnedItems';
import type { NavItemType } from '../types';

const items: NavItemType[] = [
  { type: 'link', id: 'home', label: 'Home', href: '/' },
  { type: 'link', id: 'settings', label: 'Settings', href: '/settings' },
  { type: 'link', id: 'profile', label: 'Profile', href: '/profile' },
];

describe('Spec 004: usePinnedItems', () => {
  it('starts with no pinned items', () => {
    const { result } = renderHook(() => usePinnedItems(items));
    expect(result.current.pinnedItems.length).toBe(0);
    expect(result.current.canPin).toBe(true);
  });

  it('pin and unpin work', () => {
    const { result } = renderHook(() => usePinnedItems(items));

    act(() => result.current.pin(items[0]!));
    expect(result.current.isPinned('home')).toBe(true);
    expect(result.current.pinnedItems.length).toBe(1);

    act(() => result.current.unpin('home'));
    expect(result.current.isPinned('home')).toBe(false);
    expect(result.current.pinnedItems.length).toBe(0);
  });

  it('togglePin works', () => {
    const { result } = renderHook(() => usePinnedItems(items));

    act(() => result.current.togglePin(items[0]!));
    expect(result.current.isPinned('home')).toBe(true);

    act(() => result.current.togglePin(items[0]!));
    expect(result.current.isPinned('home')).toBe(false);
  });

  it('respects maxPinned', () => {
    const { result } = renderHook(() => usePinnedItems(items, { maxPinned: 2 }));

    act(() => result.current.pin(items[0]!));
    act(() => result.current.pin(items[1]!));
    expect(result.current.canPin).toBe(false);

    // Trying to pin another should be a no-op
    act(() => result.current.pin(items[2]!));
    expect(result.current.pinnedItems.length).toBe(2);
  });

  it('reorderPinned works', () => {
    const { result } = renderHook(() => usePinnedItems(items));

    act(() => result.current.pin(items[0]!));
    act(() => result.current.pin(items[1]!));
    act(() => result.current.pin(items[2]!));

    act(() => result.current.reorderPinned(0, 2));
    expect(result.current.pinnedItems.map((i) => i.id)).toEqual(['settings', 'profile', 'home']);
  });
});
