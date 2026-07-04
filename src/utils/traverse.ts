import type { NavItemType } from "../types";

/**
 * Depth-first walk over a nav item tree.
 *
 * Shared traversal behind the hooks that previously each carried their own
 * recursive walk. Return `false` from `visit` on a group item to skip its
 * children.
 */
export function walkNavTree<TData>(
	items: NavItemType<TData>[],
	visit: (item: NavItemType<TData>, depth: number) => boolean | undefined,
	depth = 0,
): void {
	for (const item of items) {
		const descend = visit(item, depth);
		if (item.type === "group" && descend !== false) {
			walkNavTree(item.children, visit, depth + 1);
		}
	}
}

/** Flatten a nav tree depth-first into a single list of items. */
export function flattenNavTree<TData>(
	items: NavItemType<TData>[],
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];
	walkNavTree(items, (item) => {
		result.push(item);
		return undefined;
	});
	return result;
}
