"use client";

import { useCallback } from "react";
import { usePersistedList } from "./usePersistedList";

export interface RecentItem {
	id: string;
	label: string;
	href: string;
	timestamp: number;
	icon?: string;
}

export interface UseRecentlyViewedOptions {
	maxItems?: number;
	storageKey?: string;
}

export interface UseRecentlyViewedReturn {
	items: RecentItem[];
	addItem: (item: Omit<RecentItem, "timestamp">) => void;
	removeItem: (id: string) => void;
	clearAll: () => void;
}

function isRecentItem(item: unknown): item is RecentItem {
	return (
		typeof item === "object" &&
		item !== null &&
		"id" in item &&
		"href" in item &&
		"timestamp" in item
	);
}

/**
 * Track the most recently visited pages in most-recent-first order.
 *
 * Built on {@link usePersistedList}; re-adding an existing id moves it to the
 * front with a fresh timestamp.
 */
export function useRecentlyViewed({
	maxItems = 10,
	storageKey = "nav-recently-viewed",
}: UseRecentlyViewedOptions = {}): UseRecentlyViewedReturn {
	const { items, upsertFirst, remove, clear } = usePersistedList<RecentItem>({
		getId: (item) => item.id,
		storageKey,
		maxItems,
		parse: (raw) =>
			Array.isArray(raw) ? raw.filter(isRecentItem).slice(0, maxItems) : [],
	});

	const addItem = useCallback(
		(item: Omit<RecentItem, "timestamp">) => {
			upsertFirst({ ...item, timestamp: Date.now() });
		},
		[upsertFirst],
	);

	return { items, addItem, removeItem: remove, clearAll: clear };
}
