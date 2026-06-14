"use client";

import { usePersistedList } from "./usePersistedList";

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

const parsePages = (raw: unknown): StarredPage[] =>
	Array.isArray(raw)
		? raw.filter(
				(item: unknown): item is StarredPage =>
					typeof item === "object" &&
					item !== null &&
					"id" in item &&
					"href" in item,
			)
		: [];

export function useStarredPages({
	maxItems = 20,
	storageKey = "nav-starred-pages",
}: UseStarredPagesOptions = {}): UseStarredPagesReturn {
	const {
		items,
		has: isStarred,
		add: star,
		remove: unstar,
		toggle: toggleStar,
		reorder,
		clear: clearAll,
	} = usePersistedList<StarredPage>({
		getId: (page) => page.id,
		storageKey,
		maxItems,
		parse: parsePages,
	});

	return { items, isStarred, star, unstar, toggleStar, reorder, clearAll };
}
