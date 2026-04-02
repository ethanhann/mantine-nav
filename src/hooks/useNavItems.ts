'use client';

import { useCallback, useMemo, useState } from 'react';
import type { NavItemType } from '../types';
import { filterVisibleItems } from '../utils/visibility';
import { sortItemsByWeight } from '../utils/sorting';

export interface UseNavItemsReturn<TData = unknown> {
  flatItems: NavItemType<TData>[];
  expandedKeys: Set<string>;
  toggleGroup: (key: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (key: string) => boolean;
}

function collectGroupKeys<TData>(items: NavItemType<TData>[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (item.type === 'group') {
      keys.push(item.id);
      keys.push(...collectGroupKeys(item.children));
    }
  }
  return keys;
}

function collectDefaultExpanded<TData>(items: NavItemType<TData>[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (item.type === 'group') {
      if (item.defaultOpened) {
        keys.push(item.id);
      }
      keys.push(...collectDefaultExpanded(item.children));
    }
  }
  return keys;
}

function flattenVisible<TData>(
  items: NavItemType<TData>[],
  expanded: Set<string>,
): NavItemType<TData>[] {
  const result: NavItemType<TData>[] = [];
  for (const item of items) {
    result.push(item);
    if (item.type === 'group' && expanded.has(item.id)) {
      result.push(...flattenVisible(item.children, expanded));
    }
  }
  return result;
}

export function useNavItems<TData = unknown>(
  items: NavItemType<TData>[],
): UseNavItemsReturn<TData> {
  const visibleItemTree = sortItemsByWeight(filterVisibleItems(items));

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(collectDefaultExpanded(visibleItemTree)),
  );

  const toggleGroup = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedKeys(new Set(collectGroupKeys(visibleItemTree)));
  }, [visibleItemTree]);

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, []);

  const isExpanded = useCallback(
    (key: string) => expandedKeys.has(key),
    [expandedKeys],
  );

  const flatItems = useMemo(
    () => flattenVisible(visibleItemTree, expandedKeys),
    [visibleItemTree, expandedKeys],
  );

  return { flatItems, expandedKeys, toggleGroup, expandAll, collapseAll, isExpanded };
}
