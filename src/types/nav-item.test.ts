import { describe, it, expectTypeOf } from 'vitest';
import type {
  NavItemType,
  NavLinkItem,
  NavGroupItem,
  NavSectionHeader,
  NavDividerItem,
  NavCallbacks,
} from './nav-item';

describe('Spec 044: TypeScript-First types', () => {
  it('discriminated union narrowing works', () => {
    const item: NavItemType = {
      type: 'link',
      id: '1',
      label: 'Test',
      href: '/test',
    };

    if (item.type === 'link') {
      expectTypeOf(item).toMatchTypeOf<NavLinkItem>();
      expectTypeOf(item.href).toBeString();
    }

    const group: NavItemType = {
      type: 'group',
      id: '2',
      label: 'Group',
      children: [],
    };

    if (group.type === 'group') {
      expectTypeOf(group).toMatchTypeOf<NavGroupItem>();
      expectTypeOf(group.children).toBeArray();
    }
  });

  it('generic TData flows to callbacks with correct type', () => {
    interface ProjectData {
      projectId: string;
      color: string;
    }

    const callbacks: NavCallbacks<ProjectData> = {
      onItemClick: (item) => {
        expectTypeOf(item.data).toEqualTypeOf<ProjectData | undefined>();
      },
      onGroupToggle: (item, opened) => {
        expectTypeOf(item.data).toEqualTypeOf<ProjectData | undefined>();
        expectTypeOf(opened).toBeBoolean();
      },
    };

    void callbacks;
  });

  it('all discriminated union variants exist', () => {
    const link: NavLinkItem = { type: 'link', id: '1', label: 'L', href: '/' };
    const group: NavGroupItem = { type: 'group', id: '2', label: 'G', children: [] };
    const section: NavSectionHeader = { type: 'section', id: '3', label: 'S' };
    const divider: NavDividerItem = { type: 'divider', id: '4' };

    const items: NavItemType[] = [link, group, section, divider];
    expectTypeOf(items).toBeArray();
  });

  it('NavLinkItem requires href', () => {
    const link: NavLinkItem = {
      type: 'link',
      id: '1',
      label: 'Test',
      href: '/test',
    };
    expectTypeOf(link.href).toBeString();
  });

  it('NavGroupItem requires children', () => {
    const group: NavGroupItem = {
      type: 'group',
      id: '1',
      label: 'Group',
      children: [],
    };
    expectTypeOf(group.children).toBeArray();
  });

  it('as const item arrays work', () => {
    const items = [
      { type: 'link' as const, id: '1', label: 'Home', href: '/' },
      { type: 'divider' as const, id: '2' },
    ] as const;

    // Each item should be assignable to NavItemType
    const _typed: readonly NavItemType[] = items;
    void _typed;
  });

  it('type-only imports work', () => {
    // This test verifies the import at the top of this file works
    type _Link = NavLinkItem;
    type _Group = NavGroupItem;
    type _Section = NavSectionHeader;
    type _Divider = NavDividerItem;
  });
});
