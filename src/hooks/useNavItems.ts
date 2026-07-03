"use client";

import { useEffect, useMemo, useRef } from "react";
import type { NavItemType } from "../types";
import { sortItemsByWeight } from "../utils/sorting";
import { walkNavTree } from "../utils/traverse";
import { filterVisibleItems } from "../utils/visibility";
import { collectGroupIds, useExpandedKeys } from "./useExpandedKeys";

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
	walkNavTree(items, (item) => {
		if (item.type === "group" && item.defaultOpened) keys.push(item.id);
		return undefined;
	});
	return keys;
}

function flattenVisible<TData>(
	items: NavItemType<TData>[],
	expanded: Set<string>,
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];
	walkNavTree(items, (item) => {
		result.push(item);
		return item.type === "group" ? expanded.has(item.id) : undefined;
	});
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

	const {
		expandedKeys,
		toggleGroup,
		expandAll,
		collapseAll,
		isExpanded,
		setExpandedKeys,
	} = useExpandedKeys(visibleItemTree, () =>
		collectDefaultExpanded(visibleItemTree),
	);

	// The initializer above only runs once, so groups added after mount (e.g.
	// async-loaded nav items) would never honor defaultOpened. Expand each
	// newly appearing defaultOpened group exactly once, without re-opening
	// groups the user has since collapsed.
	const knownGroupIds = useRef<Set<string> | null>(null);
	useEffect(() => {
		const allIds = new Set(collectGroupIds(visibleItemTree));
		if (knownGroupIds.current === null) {
			knownGroupIds.current = allIds;
			return;
		}
		const known = knownGroupIds.current;
		const toOpen = collectDefaultExpanded(visibleItemTree).filter(
			(id) => !known.has(id),
		);
		knownGroupIds.current = allIds;
		if (toOpen.length > 0) {
			setExpandedKeys((prev) => {
				const next = new Set(prev);
				for (const id of toOpen) next.add(id);
				return next;
			});
		}
	}, [visibleItemTree, setExpandedKeys]);

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
