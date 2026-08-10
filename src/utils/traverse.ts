import type { NavItemType } from "../types";

/**
 * Depth-first walk over a nav item tree.
 *
 * Shared traversal behind the hooks that previously each carried their own
 * recursive walk. Return `false` from `visit` on a group item to skip its
 * children, or return `"stop"` to abort the entire walk immediately.
 *
 * @returns `true` if the walk was stopped early via `"stop"`, `false` otherwise.
 */
export function walkNavTree<TData>(
	items: NavItemType<TData>[],
	visit: (
		item: NavItemType<TData>,
		depth: number,
	) => boolean | "stop" | undefined,
	depth = 0,
): boolean {
	for (const item of items) {
		const descend = visit(item, depth);
		if (descend === "stop") return true;
		if (item.type === "group" && descend !== false) {
			if (walkNavTree(item.children, visit, depth + 1)) return true;
		}
	}
	return false;
}

/**
 * Find the first item in a nav tree that matches a predicate.
 *
 * Uses `walkNavTree` with early termination so the walk stops as soon as a
 * match is found.
 */
export function findInNavTree<TData>(
	items: NavItemType<TData>[],
	predicate: (item: NavItemType<TData>, depth: number) => boolean,
): NavItemType<TData> | null {
	let found: NavItemType<TData> | null = null;
	walkNavTree(items, (item, depth) => {
		if (predicate(item, depth)) {
			found = item;
			return "stop";
		}
	});
	return found;
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
