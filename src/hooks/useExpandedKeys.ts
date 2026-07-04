"use client";

import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useState,
} from "react";
import type { NavItemType } from "../types";
import { walkNavTree } from "../utils/traverse";

export interface UseExpandedKeysReturn {
	expandedKeys: Set<string>;
	isExpanded: (key: string) => boolean;
	toggleGroup: (key: string) => void;
	expandGroup: (key: string) => void;
	collapseGroup: (key: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
	setExpandedKeys: Dispatch<SetStateAction<Set<string>>>;
}

/** Collect the ids of every `group` item in a nav tree, recursively. */
export function collectGroupIds<TData>(items: NavItemType<TData>[]): string[] {
	const keys: string[] = [];
	walkNavTree(items, (item) => {
		if (item.type === "group") keys.push(item.id);
		return undefined;
	});
	return keys;
}

/**
 * Manage the set of expanded group keys for a nav tree.
 *
 * Shared primitive behind {@link useNavItems} and {@link useHeadlessSidebar};
 * provides the common toggle / expand / collapse / expand-all / collapse-all
 * Set operations so they aren't reimplemented in each hook.
 *
 * @param items - The nav tree, used by `expandAll` to discover group ids.
 * @param getInitial - Lazy initializer for the initially expanded keys (runs once).
 */
export function useExpandedKeys<TData = unknown>(
	items: NavItemType<TData>[],
	getInitial?: () => Iterable<string>,
): UseExpandedKeysReturn {
	const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
		() => new Set(getInitial?.() ?? []),
	);

	const isExpanded = useCallback(
		(key: string) => expandedKeys.has(key),
		[expandedKeys],
	);

	const toggleGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const expandGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => new Set(prev).add(key));
	}, []);

	const collapseGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => {
			const next = new Set(prev);
			next.delete(key);
			return next;
		});
	}, []);

	const expandAll = useCallback(() => {
		setExpandedKeys(new Set(collectGroupIds(items)));
	}, [items]);

	const collapseAll = useCallback(() => setExpandedKeys(new Set()), []);

	return {
		expandedKeys,
		isExpanded,
		toggleGroup,
		expandGroup,
		collapseGroup,
		expandAll,
		collapseAll,
		setExpandedKeys,
	};
}
