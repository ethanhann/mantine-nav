"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UsePersistedListOptions<T> {
	/** Unique identity for each entry, used for dedupe/lookup. */
	getId: (item: T) => string;
	/** localStorage key. Omit to keep the list in memory only. */
	storageKey?: string;
	/** Upper bound on list length. Adds beyond this are ignored. */
	maxItems?: number;
	/**
	 * Parse/validate a raw JSON value loaded from storage into a list. Defaults
	 * to accepting any array as-is.
	 */
	parse?: (raw: unknown) => T[];
}

export interface UsePersistedListReturn<T> {
	items: T[];
	ids: Set<string>;
	has: (id: string) => boolean;
	add: (item: T) => void;
	/**
	 * Insert at the front, replacing any existing entry with the same id and
	 * evicting from the end past `maxItems` (most-recently-used semantics).
	 */
	upsertFirst: (item: T) => void;
	remove: (id: string) => void;
	toggle: (item: T) => void;
	reorder: (fromIndex: number, toIndex: number) => void;
	clear: () => void;
	/** True when another item can be added without exceeding `maxItems`. */
	canAdd: boolean;
}

function loadFromStorage<T>(key: string, parse: (raw: unknown) => T[]): T[] {
	if (typeof window === "undefined") return [];
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return [];
		return parse(JSON.parse(stored));
	} catch {
		return [];
	}
}

function saveToStorage<T>(key: string, items: T[]) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(items));
	} catch {
		// ignore quota / serialization errors
	}
}

/**
 * Manage an ordered, optionally persisted list with stable callbacks.
 *
 * Shared primitive behind {@link usePinnedItems} and {@link useStarredPages}.
 * All mutators use functional state updates, so they keep a stable identity
 * across changes rather than being recreated on every mutation.
 */
export function usePersistedList<T>({
	getId,
	storageKey,
	maxItems = Number.POSITIVE_INFINITY,
	parse = (raw) => (Array.isArray(raw) ? (raw as T[]) : []),
}: UsePersistedListOptions<T>): UsePersistedListReturn<T> {
	const getIdRef = useRef(getId);
	getIdRef.current = getId;
	const maxItemsRef = useRef(maxItems);
	maxItemsRef.current = maxItems;
	const parseRef = useRef(parse);
	parseRef.current = parse;

	const [items, setItems] = useState<T[]>(() =>
		storageKey ? loadFromStorage(storageKey, parse) : [],
	);

	const isFirstRun = useRef(true);
	const fromStorageRef = useRef(false);
	useEffect(() => {
		if (isFirstRun.current) {
			isFirstRun.current = false;
			return;
		}
		if (fromStorageRef.current) {
			fromStorageRef.current = false;
			return;
		}
		if (storageKey) saveToStorage(storageKey, items);
	}, [items, storageKey]);

	useEffect(() => {
		if (!storageKey || typeof window === "undefined") return;
		const handler = (event: StorageEvent) => {
			if (event.key !== storageKey) return;
			if (event.newValue === null) {
				fromStorageRef.current = true;
				setItems([]);
				return;
			}
			try {
				const parsed = parseRef.current(JSON.parse(event.newValue));
				fromStorageRef.current = true;
				setItems(parsed);
			} catch {
				// ignore malformed JSON
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [storageKey]);

	const ids = useMemo(
		() => new Set(items.map((i) => getIdRef.current(i))),
		[items],
	);

	const has = useCallback((id: string) => ids.has(id), [ids]);

	const add = useCallback((item: T) => {
		setItems((prev) => {
			const id = getIdRef.current(item);
			if (prev.length >= maxItemsRef.current) return prev;
			if (prev.some((i) => getIdRef.current(i) === id)) return prev;
			return [...prev, item];
		});
	}, []);

	const upsertFirst = useCallback((item: T) => {
		setItems((prev) => {
			const id = getIdRef.current(item);
			const filtered = prev.filter((i) => getIdRef.current(i) !== id);
			return [item, ...filtered].slice(0, maxItemsRef.current);
		});
	}, []);

	const remove = useCallback((id: string) => {
		setItems((prev) => prev.filter((i) => getIdRef.current(i) !== id));
	}, []);

	const toggle = useCallback((item: T) => {
		setItems((prev) => {
			const id = getIdRef.current(item);
			if (prev.some((i) => getIdRef.current(i) === id)) {
				return prev.filter((i) => getIdRef.current(i) !== id);
			}
			if (prev.length >= maxItemsRef.current) return prev;
			return [...prev, item];
		});
	}, []);

	const reorder = useCallback((fromIndex: number, toIndex: number) => {
		setItems((prev) => {
			const next = [...prev];
			const [moved] = next.splice(fromIndex, 1);
			if (moved !== undefined) next.splice(toIndex, 0, moved);
			return next;
		});
	}, []);

	const clear = useCallback(() => setItems([]), []);

	const canAdd = items.length < maxItems;

	return {
		items,
		ids,
		has,
		add,
		upsertFirst,
		remove,
		toggle,
		reorder,
		clear,
		canAdd,
	};
}
