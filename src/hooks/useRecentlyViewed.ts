"use client";

import { useCallback, useState } from "react";

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

function loadRecent(key: string): RecentItem[] {
	if (typeof window === "undefined") return [];
	try {
		const data = JSON.parse(localStorage.getItem(key) || "[]");
		if (!Array.isArray(data)) return [];
		return data.filter(
			(item: unknown): item is RecentItem =>
				typeof item === "object" &&
				item !== null &&
				"id" in item &&
				"href" in item &&
				"timestamp" in item,
		);
	} catch {
		return [];
	}
}

function saveRecent(key: string, items: RecentItem[]) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(items));
	} catch {
		/* ignore */
	}
}

export function useRecentlyViewed({
	maxItems = 10,
	storageKey = "nav-recently-viewed",
}: UseRecentlyViewedOptions = {}): UseRecentlyViewedReturn {
	const [items, setItems] = useState<RecentItem[]>(() =>
		loadRecent(storageKey),
	);

	const addItem = useCallback(
		(item: Omit<RecentItem, "timestamp">) => {
			setItems((prev) => {
				const filtered = prev.filter((i) => i.id !== item.id);
				const next = [{ ...item, timestamp: Date.now() }, ...filtered].slice(
					0,
					maxItems,
				);
				saveRecent(storageKey, next);
				return next;
			});
		},
		[maxItems, storageKey],
	);

	const removeItem = useCallback(
		(id: string) => {
			setItems((prev) => {
				const next = prev.filter((i) => i.id !== id);
				saveRecent(storageKey, next);
				return next;
			});
		},
		[storageKey],
	);

	const clearAll = useCallback(() => {
		setItems([]);
		saveRecent(storageKey, []);
	}, [storageKey]);

	return { items, addItem, removeItem, clearAll };
}
