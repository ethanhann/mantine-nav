"use client";

import { useCallback, useMemo, useState } from "react";
import type { NavItemType } from "../types";

export interface UsePinnedItemsOptions {
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

function loadFromStorage(key: string): string[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return [];
		const data = JSON.parse(stored);
		if (!Array.isArray(data)) return [];
		return data.filter(
			(item: unknown): item is string => typeof item === "string",
		);
	} catch {
		return [];
	}
}

function saveToStorage(key: string, ids: string[]) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(ids));
	} catch {
		// ignore quota errors
	}
}

export function usePinnedItems<TData = unknown>(
	allItems: NavItemType<TData>[],
	options: UsePinnedItemsOptions = {},
): UsePinnedItemsReturn<TData> {
	const { maxPinned = 10, storageKey } = options;

	const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
		if (storageKey) return loadFromStorage(storageKey);
		return [];
	});

	const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

	// Flatten all items to find pinned ones
	const flatItems = useMemo(() => {
		const result: NavItemType<TData>[] = [];
		function collect(items: NavItemType<TData>[]) {
			for (const item of items) {
				result.push(item);
				if (item.type === "group") collect(item.children);
			}
		}
		collect(allItems);
		return result;
	}, [allItems]);

	const pinnedItems = useMemo(
		() =>
			pinnedIds
				.map((id) => flatItems.find((i) => i.id === id))
				.filter((i): i is NavItemType<TData> => i !== undefined),
		[pinnedIds, flatItems],
	);

	const canPin = pinnedIds.length < maxPinned;

	const updatePinned = useCallback(
		(newIds: string[]) => {
			setPinnedIds(newIds);
			if (storageKey) saveToStorage(storageKey, newIds);
		},
		[storageKey],
	);

	const pin = useCallback(
		(item: NavItemType<TData>) => {
			if (pinnedIds.length >= maxPinned) return;
			if (pinnedIds.includes(item.id)) return;
			updatePinned([...pinnedIds, item.id]);
		},
		[pinnedIds, maxPinned, updatePinned],
	);

	const unpin = useCallback(
		(id: string) => {
			updatePinned(pinnedIds.filter((pid) => pid !== id));
		},
		[pinnedIds, updatePinned],
	);

	const togglePin = useCallback(
		(item: NavItemType<TData>) => {
			if (pinnedIds.includes(item.id)) {
				unpin(item.id);
			} else {
				pin(item);
			}
		},
		[pinnedIds, pin, unpin],
	);

	const isPinned = useCallback((id: string) => pinnedSet.has(id), [pinnedSet]);

	const reorderPinned = useCallback(
		(fromIndex: number, toIndex: number) => {
			const newIds = [...pinnedIds];
			const [moved] = newIds.splice(fromIndex, 1);
			if (moved) newIds.splice(toIndex, 0, moved);
			updatePinned(newIds);
		},
		[pinnedIds, updatePinned],
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
