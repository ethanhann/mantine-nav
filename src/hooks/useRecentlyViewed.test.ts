import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentlyViewed } from './useRecentlyViewed';

describe('Spec 030: useRecentlyViewed', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useRecentlyViewed({ storageKey: 'test-recent' }));
    expect(result.current.items.length).toBe(0);
  });

  it('adds items with timestamp', () => {
    const { result } = renderHook(() => useRecentlyViewed({ storageKey: 'test-recent-add' }));
    act(() => result.current.addItem({ id: '1', label: 'Page 1', href: '/page1' }));
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]!.label).toBe('Page 1');
    expect(result.current.items[0]!.timestamp).toBeGreaterThan(0);
  });

  it('removes duplicates and moves to front', () => {
    const { result } = renderHook(() => useRecentlyViewed({ storageKey: 'test-recent-dedup' }));
    act(() => result.current.addItem({ id: '1', label: 'Page 1', href: '/p1' }));
    act(() => result.current.addItem({ id: '2', label: 'Page 2', href: '/p2' }));
    act(() => result.current.addItem({ id: '1', label: 'Page 1', href: '/p1' }));
    expect(result.current.items.length).toBe(2);
    expect(result.current.items[0]!.id).toBe('1');
  });

  it('respects maxItems', () => {
    const { result } = renderHook(() => useRecentlyViewed({ maxItems: 2, storageKey: 'test-recent-max' }));
    act(() => result.current.addItem({ id: '1', label: 'P1', href: '/1' }));
    act(() => result.current.addItem({ id: '2', label: 'P2', href: '/2' }));
    act(() => result.current.addItem({ id: '3', label: 'P3', href: '/3' }));
    expect(result.current.items.length).toBe(2);
    expect(result.current.items[0]!.id).toBe('3');
  });

  it('clearAll removes all items', () => {
    const { result } = renderHook(() => useRecentlyViewed({ storageKey: 'test-recent-clear' }));
    act(() => result.current.addItem({ id: '1', label: 'P1', href: '/1' }));
    act(() => result.current.clearAll());
    expect(result.current.items.length).toBe(0);
  });
});
