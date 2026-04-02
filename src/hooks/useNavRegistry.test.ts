import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavRegistry } from './useNavRegistry';
import type { NavGroupItem, NavLinkItem } from '../types';

describe('useNavRegistry', () => {
  it('registers a single link item', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('dashboard', {
        type: 'link',
        label: 'Dashboard',
        href: '/dashboard',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      id: 'dashboard',
      type: 'link',
      label: 'Dashboard',
      href: '/dashboard',
    });
  });

  it('builds a nested tree from dot-notation IDs', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('products', {
        type: 'group',
        label: 'Products',
      });
      result.current.register('products.catalog', {
        type: 'link',
        label: 'Catalog',
        href: '/products/catalog',
      });
      result.current.register('products.inventory', {
        type: 'link',
        label: 'Inventory',
        href: '/products/inventory',
      });
    });

    expect(result.current.items).toHaveLength(1);
    const group = result.current.items[0] as NavGroupItem;
    expect(group.type).toBe('group');
    expect(group.label).toBe('Products');
    expect(group.children).toHaveLength(2);
    expect(group.children[0]).toMatchObject({ id: 'products.catalog', type: 'link' });
    expect(group.children[1]).toMatchObject({ id: 'products.inventory', type: 'link' });
  });

  it('auto-creates placeholder group when child registered before parent', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('settings.general', {
        type: 'link',
        label: 'General',
        href: '/settings/general',
      });
    });

    // Should auto-create a 'settings' group
    expect(result.current.items).toHaveLength(1);
    const group = result.current.items[0] as NavGroupItem;
    expect(group.type).toBe('group');
    expect(group.id).toBe('settings');
    expect(group.label).toBe('settings'); // auto-derived from ID segment
    expect(group.children).toHaveLength(1);

    // Now register the parent with a proper label
    act(() => {
      result.current.register('settings', {
        type: 'group',
        label: 'Settings',
      });
    });

    const updatedGroup = result.current.items[0] as NavGroupItem;
    expect(updatedGroup.label).toBe('Settings');
    expect(updatedGroup.children).toHaveLength(1);
  });

  it('builds deeply nested tree (a.b.c)', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('a.b.c', {
        type: 'link',
        label: 'Deep Item',
        href: '/a/b/c',
      });
    });

    expect(result.current.items).toHaveLength(1);
    const a = result.current.items[0] as NavGroupItem;
    expect(a.id).toBe('a');
    expect(a.type).toBe('group');
    const b = a.children[0] as NavGroupItem;
    expect(b.id).toBe('a.b');
    expect(b.type).toBe('group');
    const c = b.children[0] as NavLinkItem;
    expect(c.id).toBe('a.b.c');
    expect(c.type).toBe('link');
    expect(c.label).toBe('Deep Item');
  });

  it('unregisters an item and re-derives tree', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('home', { type: 'link', label: 'Home', href: '/' });
      result.current.register('about', { type: 'link', label: 'About', href: '/about' });
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.unregister('about');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ id: 'home' });
  });

  it('clears all items', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('a', { type: 'link', label: 'A', href: '/a' });
      result.current.register('b', { type: 'link', label: 'B', href: '/b' });
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('applies weight sorting to derived tree', () => {
    const { result } = renderHook(() => useNavRegistry());

    act(() => {
      result.current.register('c', { type: 'link', label: 'C', href: '/c', weight: 30 });
      result.current.register('a', { type: 'link', label: 'A', href: '/a', weight: 10 });
      result.current.register('b', { type: 'link', label: 'B', href: '/b', weight: 20 });
    });

    expect(result.current.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('register and unregister callbacks are stable', () => {
    const { result, rerender } = renderHook(() => useNavRegistry());

    const register1 = result.current.register;
    const unregister1 = result.current.unregister;
    const clear1 = result.current.clear;

    rerender();

    expect(result.current.register).toBe(register1);
    expect(result.current.unregister).toBe(unregister1);
    expect(result.current.clear).toBe(clear1);
  });
});
