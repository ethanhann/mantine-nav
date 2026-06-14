"use client";

import { useMemo } from "react";
import type { NavItemType } from "../types";
import { sortItemsByWeight } from "../utils/sorting";
import { filterVisibleItems } from "../utils/visibility";
import { useExpandedKeys } from "./useExpandedKeys";

export interface UseNavItemsReturn<TData = unknown> {
	flatItems: NavItemType<TData>[];
	expandedKeys: Set<string>;
	toggleGroup: (key: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
	isExpanded: (key: string) => boolean;
}

function collectDefaultExpanded<TData>(items: NavItemType<TData>[]): string[] {
	const keys: string[] = [];
	for (const item of items) {
		if (item.type === "group") {
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
		if (item.type === "group" && expanded.has(item.id)) {
			result.push(...flattenVisible(item.children, expanded));
		}
	}
	return result;
}

export function useNavItems<TData = unknown>(
	items: NavItemType<TData>[],
): UseNavItemsReturn<TData> {
	// Memoized so its reference is stable across renders; otherwise a fresh array
	// every render would invalidate the downstream flatItems memo on each render.
	const visibleItemTree = useMemo(
		() => sortItemsByWeight(filterVisibleItems(items)),
		[items],
	);

	const { expandedKeys, toggleGroup, expandAll, collapseAll, isExpanded } =
		useExpandedKeys(visibleItemTree, () =>
			collectDefaultExpanded(visibleItemTree),
		);

	const flatItems = useMemo(
		() => flattenVisible(visibleItemTree, expandedKeys),
		[visibleItemTree, expandedKeys],
	);

	return {
		flatItems,
		expandedKeys,
		toggleGroup,
		expandAll,
		collapseAll,
		isExpanded,
	};
}
