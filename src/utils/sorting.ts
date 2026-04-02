import type { NavItemType, NavGroupItem } from '../types';

/**
 * Sort items by weight (lower weight = higher in list).
 * Items without weight default to 0. Stable sort preserves
 * original order for items with equal weight.
 * Recurses into group children.
 */
export function sortItemsByWeight<TData>(items: NavItemType<TData>[]): NavItemType<TData>[] {
  const sorted = items.slice().sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  return sorted.map((item) => {
    if (item.type === 'group') {
      return { ...item, children: sortItemsByWeight(item.children) } as NavGroupItem<TData>;
    }
    return item;
  });
}
