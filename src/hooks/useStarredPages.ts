"use client";

import { useCallback, useState } from "react";

export interface StarredPage {
	id: string;
	label: string;
	href: string;
	icon?: string;
}

export interface UseStarredPagesOptions {
	maxItems?: number;
	storageKey?: string;
}

export interface UseStarredPagesReturn {
	items: StarredPage[];
	isStarred: (id: string) => boolean;
	star: (page: StarredPage) => void;
	unstar: (id: string) => void;
	toggleStar: (page: StarredPage) => void;
	reorder: (fromIndex: number, toIndex: number) => void;
	clearAll: () => void;
}

function loadStarred(key: string): StarredPage[] {
	if (typeof window === "undefined") return [];
	try {
		const data = JSON.parse(localStorage.getItem(key) || "[]");
		if (!Array.isArray(data)) return [];
		return data.filter(
			(item: unknown): item is StarredPage =>
				typeof item === "object" &&
				item !== null &&
				"id" in item &&
				"href" in item,
		);
	} catch {
		return [];
	}
}

function saveStarred(key: string, items: StarredPage[]) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(items));
	} catch {
		/* ignore */
	}
}

export function useStarredPages({
	maxItems = 20,
	storageKey = "nav-starred-pages",
}: UseStarredPagesOptions = {}): UseStarredPagesReturn {
	const [items, setItems] = useState<StarredPage[]>(() =>
		loadStarred(storageKey),
	);

	const isStarred = useCallback(
		(id: string) => items.some((i) => i.id === id),
		[items],
	);

	const star = useCallback(
		(page: StarredPage) => {
			setItems((prev) => {
				if (prev.some((i) => i.id === page.id)) return prev;
				const next = [...prev, page].slice(0, maxItems);
				saveStarred(storageKey, next);
				return next;
			});
		},
		[maxItems, storageKey],
	);

	const unstar = useCallback(
		(id: string) => {
			setItems((prev) => {
				const next = prev.filter((i) => i.id !== id);
				saveStarred(storageKey, next);
				return next;
			});
		},
		[storageKey],
	);

	const toggleStar = useCallback(
		(page: StarredPage) => {
			if (isStarred(page.id)) {
				unstar(page.id);
			} else {
				star(page);
			}
		},
		[isStarred, star, unstar],
	);

	const reorder = useCallback(
		(fromIndex: number, toIndex: number) => {
			setItems((prev) => {
				const next = [...prev];
				const [moved] = next.splice(fromIndex, 1);
				if (moved) next.splice(toIndex, 0, moved);
				saveStarred(storageKey, next);
				return next;
			});
		},
		[storageKey],
	);

	const clearAll = useCallback(() => {
		setItems([]);
		saveStarred(storageKey, []);
	}, [storageKey]);

	return { items, isStarred, star, unstar, toggleStar, reorder, clearAll };
}
