import { describe, it, expect } from 'vitest';
import { sortItemsByWeight } from './sorting';
import type { NavItemType } from '../types';

describe('sortItemsByWeight', () => {
  it('preserves order when no items have weight', () => {
    const items: NavItemType[] = [
      { id: 'a', type: 'link', label: 'A', href: '/a' },
      { id: 'b', type: 'link', label: 'B', href: '/b' },
      { id: 'c', type: 'link', label: 'C', href: '/c' },
    ];
    const sorted = sortItemsByWeight(items);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts items by weight ascending', () => {
    const items: NavItemType[] = [
      { id: 'c', type: 'link', label: 'C', href: '/c', weight: 30 },
      { id: 'a', type: 'link', label: 'A', href: '/a', weight: 10 },
      { id: 'b', type: 'link', label: 'B', href: '/b', weight: 20 },
    ];
    const sorted = sortItemsByWeight(items);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('handles negative weights', () => {
    const items: NavItemType[] = [
      { id: 'b', type: 'link', label: 'B', href: '/b', weight: 0 },
      { id: 'a', type: 'link', label: 'A', href: '/a', weight: -10 },
      { id: 'c', type: 'link', label: 'C', href: '/c', weight: 10 },
    ];
    const sorted = sortItemsByWeight(items);
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('is stable for equal weights', () => {
    const items: NavItemType[] = [
      { id: 'x', type: 'link', label: 'X', href: '/x', weight: 5 },
      { id: 'y', type: 'link', label: 'Y', href: '/y', weight: 5 },
      { id: 'z', type: 'link', label: 'Z', href: '/z', weight: 5 },
    ];
    const sorted = sortItemsByWeight(items);
    expect(sorted.map((i) => i.id)).toEqual(['x', 'y', 'z']);
  });

  it('sorts group children recursively', () => {
    const items: NavItemType[] = [
      {
        id: 'g', type: 'group', label: 'Group',
        children: [
          { id: 'g-c', type: 'link', label: 'C', href: '/c', weight: 30 },
          { id: 'g-a', type: 'link', label: 'A', href: '/a', weight: 10 },
          { id: 'g-b', type: 'link', label: 'B', href: '/b', weight: 20 },
        ],
      },
    ];
    const sorted = sortItemsByWeight(items);
    const group = sorted[0] as NavItemType & { children: NavItemType[] };
    expect(group.children.map((i) => i.id)).toEqual(['g-a', 'g-b', 'g-c']);
  });

  it('does not mutate the original array', () => {
    const items: NavItemType[] = [
      { id: 'b', type: 'link', label: 'B', href: '/b', weight: 2 },
      { id: 'a', type: 'link', label: 'A', href: '/a', weight: 1 },
    ];
    sortItemsByWeight(items);
    expect(items[0]!.id).toBe('b');
  });
});
