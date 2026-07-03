"use client";

import { useCallback, useMemo } from "react";
import type { NavItemType } from "../types";
import { flattenNavTree } from "../utils/traverse";
import { usePersistedList } from "./usePersistedList";

export interface UsePinnedItemsOptions {
	/** Upper bound on pinned items, matching the other persistence hooks. */
	maxItems?: number;
	/** @deprecated Use `maxItems` instead. */
	maxPinned?: number;
	storageKey?: string;
}

export interface UsePinnedItemsReturn<TData = unknown> {
	pinnedIds: Set<string>;
	pinnedItems: NavItemType<TData>[];
	isPinned: (id: string) => boolean;
	pin: (item: NavItemType<TData>) => void;
	unpin: (id: string) => void;
	togglePin: (item: NavItemType<TData>) => void;
	canPin: boolean;
	reorderPinned: (fromIndex: number, toIndex: number) => void;
}

const parseIds = (raw: unknown): string[] =>
	Array.isArray(raw)
		? raw.filter((item): item is string => typeof item === "string")
		: [];

export function usePinnedItems<TData = unknown>(
	allItems: NavItemType<TData>[],
	options: UsePinnedItemsOptions = {},
): UsePinnedItemsReturn<TData> {
	const { maxItems, maxPinned, storageKey } = options;
	const resolvedMaxItems = maxItems ?? maxPinned ?? 10;

	const {
		items: pinnedIdList,
		ids: pinnedSet,
		has: isPinned,
		add,
		remove: unpin,
		toggle,
		reorder: reorderPinned,
		canAdd: canPin,
	} = usePersistedList<string>({
		getId: (id) => id,
		storageKey,
		maxItems: resolvedMaxItems,
		parse: parseIds,
	});

	// Flatten all items to find pinned ones
	const flatItems = useMemo(() => flattenNavTree(allItems), [allItems]);

	const pinnedItems = useMemo(
		() =>
			pinnedIdList
				.map((id) => flatItems.find((i) => i.id === id))
				.filter((i): i is NavItemType<TData> => i !== undefined),
		[pinnedIdList, flatItems],
	);

	const pin = useCallback((item: NavItemType<TData>) => add(item.id), [add]);

	const togglePin = useCallback(
		(item: NavItemType<TData>) => toggle(item.id),
		[toggle],
	);

	return {
		pinnedIds: pinnedSet,
		pinnedItems,
		isPinned,
		pin,
		unpin,
		togglePin,
		canPin,
		reorderPinned,
	};
}
