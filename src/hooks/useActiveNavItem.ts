'use client';

import { useMemo } from 'react';
import type { ActiveMatcher, NavItemType, NavLinkItem } from '../types';
import { useCurrentPath } from './useCurrentPath';

export interface UseActiveNavItemOptions {
  currentPath?: string;
  matcher?: ActiveMatcher;
}

export interface UseActiveNavItemReturn<TData = unknown> {
  activeItem: NavLinkItem<TData> | null;
  activeHref: string | null;
  isActive: (item: NavItemType<TData>) => boolean;
}

function matchItem(
  currentPath: string,
  href: string,
  matcher: ActiveMatcher,
): boolean {
  if (typeof matcher === 'function' && !(matcher instanceof RegExp)) {
    return matcher(currentPath, href);
  }
  if (matcher instanceof RegExp) {
    return matcher.test(currentPath);
  }
  switch (matcher) {
    case 'exact':
      return currentPath === href;
    case 'prefix': {
      if (currentPath === href) return true;
      // /settings matches /settings/team but not /settings-old
      return currentPath.startsWith(href + '/');
    }
    case 'regex':
      return new RegExp(href).test(currentPath);
    default:
      return currentPath === href;
  }
}

function collectLinks<TData>(items: NavItemType<TData>[]): NavLinkItem<TData>[] {
  const links: NavLinkItem<TData>[] = [];
  for (const item of items) {
    if (item.type === 'link') {
      links.push(item);
    } else if (item.type === 'group' && item.children) {
      // Also check if the group itself has an href
      if (item.href) {
        links.push({
          type: 'link',
          id: item.id,
          label: item.label,
          href: item.href,
          data: item.data,
        } as NavLinkItem<TData>);
      }
      links.push(...collectLinks(item.children));
    }
  }
  return links;
}

export function useActiveNavItem<TData = unknown>(
  items: NavItemType<TData>[],
  options: UseActiveNavItemOptions = {},
): UseActiveNavItemReturn<TData> {
  const currentPath = useCurrentPath(options.currentPath);
  const defaultMatcher = options.matcher ?? 'prefix';

  const result = useMemo(() => {
    const links = collectLinks(items);
    let bestMatch: NavLinkItem<TData> | null = null;
    let bestLength = -1;

    for (const link of links) {
      const itemMatcher = link.activeExact ? 'exact' : (link.activeMatch ?? defaultMatcher);
      if (matchItem(currentPath, link.href, itemMatcher)) {
        // Most specific match wins (longest href)
        if (link.href.length > bestLength) {
          bestMatch = link;
          bestLength = link.href.length;
        }
      }
    }

    const isActive = (item: NavItemType<TData>): boolean => {
      if (item.type === 'link') {
        const itemMatcher = item.activeExact ? 'exact' : (item.activeMatch ?? defaultMatcher);
        return matchItem(currentPath, item.href, itemMatcher);
      }
      if (item.type === 'group') {
        // A group is active if any child is active
        return item.children.some((child) => isActive(child));
      }
      return false;
    };

    return {
      activeItem: bestMatch,
      activeHref: bestMatch?.href ?? null,
      isActive,
    };
  }, [items, currentPath, defaultMatcher]);

  return result;
}
