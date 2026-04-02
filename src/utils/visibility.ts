import type { NavGroupItem, NavItemType } from "../types";

/** Resolve the `visible` property to a boolean. Undefined defaults to true. */
export function isItemVisible<TData>(item: NavItemType<TData>): boolean {
	if (item.visible === undefined) return true;
	if (typeof item.visible === "function") return item.visible();
	return item.visible;
}

/**
 * Recursively filter an item tree, removing invisible items.
 * Groups whose children are all invisible are also removed.
 */
export function filterVisibleItems<TData>(
	items: NavItemType<TData>[],
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];
	for (const item of items) {
		if (!isItemVisible(item)) continue;

		if (item.type === "group") {
			const visibleChildren = filterVisibleItems(item.children);
			if (visibleChildren.length === 0) continue;
			result.push({
				...item,
				children: visibleChildren,
			} as NavGroupItem<TData>);
		} else {
			result.push(item);
		}
	}
	return result;
}
