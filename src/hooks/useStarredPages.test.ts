import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStarredPages } from './useStarredPages';

describe('Spec 031: useStarredPages', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useStarredPages({ storageKey: 'test-starred' }));
    expect(result.current.items.length).toBe(0);
  });

  it('star and unstar work', () => {
    const { result } = renderHook(() => useStarredPages({ storageKey: 'test-star-ops' }));
    act(() => result.current.star({ id: '1', label: 'Page', href: '/page' }));
    expect(result.current.isStarred('1')).toBe(true);

    act(() => result.current.unstar('1'));
    expect(result.current.isStarred('1')).toBe(false);
  });

  it('toggleStar works', () => {
    const { result } = renderHook(() => useStarredPages({ storageKey: 'test-star-toggle' }));
    const page = { id: '1', label: 'Page', href: '/page' };

    act(() => result.current.toggleStar(page));
    expect(result.current.isStarred('1')).toBe(true);

    act(() => result.current.toggleStar(page));
    expect(result.current.isStarred('1')).toBe(false);
  });

  it('reorder works', () => {
    const { result } = renderHook(() => useStarredPages({ storageKey: 'test-star-reorder' }));
    act(() => result.current.star({ id: 'a', label: 'A', href: '/a' }));
    act(() => result.current.star({ id: 'b', label: 'B', href: '/b' }));
    act(() => result.current.star({ id: 'c', label: 'C', href: '/c' }));

    act(() => result.current.reorder(0, 2));
    expect(result.current.items.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });
});
