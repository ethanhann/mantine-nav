import { describe, it, expect } from 'vitest';
import { isItemVisible, filterVisibleItems } from './visibility';
import type { NavItemType } from '../types';

describe('isItemVisible', () => {
  it('returns true when visible is undefined', () => {
    const item: NavItemType = { id: '1', type: 'link', label: 'A', href: '/' };
    expect(isItemVisible(item)).toBe(true);
  });

  it('returns true when visible is true', () => {
    const item: NavItemType = { id: '1', type: 'link', label: 'A', href: '/', visible: true };
    expect(isItemVisible(item)).toBe(true);
  });

  it('returns false when visible is false', () => {
    const item: NavItemType = { id: '1', type: 'link', label: 'A', href: '/', visible: false };
    expect(isItemVisible(item)).toBe(false);
  });

  it('calls function and returns true', () => {
    const item: NavItemType = { id: '1', type: 'link', label: 'A', href: '/', visible: () => true };
    expect(isItemVisible(item)).toBe(true);
  });

  it('calls function and returns false', () => {
    const item: NavItemType = { id: '1', type: 'link', label: 'A', href: '/', visible: () => false };
    expect(isItemVisible(item)).toBe(false);
  });
});

describe('filterVisibleItems', () => {
  it('returns all items when none have visible set', () => {
    const items: NavItemType[] = [
      { id: '1', type: 'link', label: 'A', href: '/' },
      { id: '2', type: 'link', label: 'B', href: '/b' },
    ];
    expect(filterVisibleItems(items)).toHaveLength(2);
  });

  it('removes items with visible: false', () => {
    const items: NavItemType[] = [
      { id: '1', type: 'link', label: 'A', href: '/', visible: false },
      { id: '2', type: 'link', label: 'B', href: '/b' },
    ];
    const result = filterVisibleItems(items);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('2');
  });

  it('removes items with visible callback returning false', () => {
    const items: NavItemType[] = [
      { id: '1', type: 'link', label: 'A', href: '/', visible: () => false },
      { id: '2', type: 'link', label: 'B', href: '/b' },
    ];
    const result = filterVisibleItems(items);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('2');
  });

  it('removes group when all children are invisible', () => {
    const items: NavItemType[] = [
      {
        id: 'g1',
        type: 'group',
        label: 'Group',
        children: [
          { id: '1', type: 'link', label: 'A', href: '/', visible: false },
          { id: '2', type: 'link', label: 'B', href: '/b', visible: false },
        ],
      },
    ];
    expect(filterVisibleItems(items)).toHaveLength(0);
  });

  it('keeps group when at least one child is visible', () => {
    const items: NavItemType[] = [
      {
        id: 'g1',
        type: 'group',
        label: 'Group',
        children: [
          { id: '1', type: 'link', label: 'A', href: '/', visible: false },
          { id: '2', type: 'link', label: 'B', href: '/b' },
        ],
      },
    ];
    const result = filterVisibleItems(items);
    expect(result).toHaveLength(1);
    const group = result[0] as NavItemType & { children: NavItemType[] };
    expect(group.children).toHaveLength(1);
    expect(group.children[0]!.id).toBe('2');
  });

  it('removes group with visible: false even if children are visible', () => {
    const items: NavItemType[] = [
      {
        id: 'g1',
        type: 'group',
        label: 'Group',
        visible: false,
        children: [
          { id: '1', type: 'link', label: 'A', href: '/' },
        ],
      },
    ];
    expect(filterVisibleItems(items)).toHaveLength(0);
  });

  it('handles section headers and dividers', () => {
    const items: NavItemType[] = [
      { id: 's1', type: 'section', label: 'Section', visible: false },
      { id: 'd1', type: 'divider' },
      { id: '1', type: 'link', label: 'A', href: '/' },
    ];
    const result = filterVisibleItems(items);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('d1');
    expect(result[1]!.id).toBe('1');
  });

  it('filters nested groups recursively', () => {
    const items: NavItemType[] = [
      {
        id: 'g1',
        type: 'group',
        label: 'Outer',
        children: [
          {
            id: 'g2',
            type: 'group',
            label: 'Inner',
            children: [
              { id: '1', type: 'link', label: 'A', href: '/', visible: false },
            ],
          },
          { id: '2', type: 'link', label: 'B', href: '/b' },
        ],
      },
    ];
    const result = filterVisibleItems(items);
    expect(result).toHaveLength(1);
    const outer = result[0] as NavItemType & { children: NavItemType[] };
    // Inner group removed (its only child is invisible), B remains
    expect(outer.children).toHaveLength(1);
    expect(outer.children[0]!.id).toBe('2');
  });
});
