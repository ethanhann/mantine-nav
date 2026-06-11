"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { type ReactNode, useEffect, useRef, useState } from "react";

/** A single result returned by a backend search source. */
export interface CommandSearchResult {
	id: string;
	label: string;
	href: string;
	icon?: ReactNode;
	description?: string;
	external?: boolean;
}

/** Async backend search. Receives the query and an `AbortSignal` for the
 * superseded-request case; should resolve to backend-ranked results. */
export type CommandSearchFn = (
	query: string,
	signal: AbortSignal,
) => Promise<CommandSearchResult[]>;

export interface UseCommandSearchOptions {
	/** Don't hit the backend until the query reaches this length. @default 2 */
	minLength?: number;
	/** Debounce before firing the search. @default 200 */
	debounce?: number;
	/** Delay after the request fires before showing a spinner, so fast responses
	 * don't flicker one. Total perceived delay ≈ `debounce + stallThreshold`. @default 300 */
	stallThreshold?: number;
}

export interface UseCommandSearchReturn {
	/** Latest results (kept visible while the next request is in flight). */
	results: CommandSearchResult[];
	/** A request is in flight. */
	loading: boolean;
	/** Loading has exceeded `stallThreshold` — show a spinner. */
	stalled: boolean;
	/** The last completed request rejected. */
	error: unknown;
	/** A search is pending or running for the current input — use this to
	 * suppress the empty state instead of flashing "nothing found". */
	active: boolean;
}

interface SearchState {
	results: CommandSearchResult[];
	loading: boolean;
	error: unknown;
}

const EMPTY: CommandSearchResult[] = [];

/**
 * Headless backend-search driver for the command palette. Debounces the query,
 * cancels superseded requests, keeps previous results visible while loading
 * (stale-while-revalidate), and gates the spinner behind a stall threshold.
 */
export function useCommandSearch(
	query: string,
	search: CommandSearchFn | undefined,
	{
		minLength = 2,
		debounce = 200,
		stallThreshold = 300,
	}: UseCommandSearchOptions = {},
): UseCommandSearchReturn {
	const trimmed = query.trim();
	const [debounced] = useDebouncedValue(trimmed, debounce);
	const [state, setState] = useState<SearchState>({
		results: EMPTY,
		loading: false,
		error: null,
	});
	const [stalled, setStalled] = useState(false);

	// Keep the search fn in a ref so an inline (re-created) fn doesn't re-fire
	// the effect on every render; presence is tracked via `hasSearch` instead.
	const searchRef = useRef(search);
	searchRef.current = search;
	const hasSearch = typeof search === "function";

	useEffect(() => {
		const fn = searchRef.current;
		if (!hasSearch || !fn || debounced.length < minLength) {
			setState({ results: EMPTY, loading: false, error: null });
			setStalled(false);
			return;
		}

		const controller = new AbortController();
		// Stale-while-revalidate: keep prior results, just flip loading on.
		setState((prev) => ({ ...prev, loading: true, error: null }));
		const stallTimer = setTimeout(() => setStalled(true), stallThreshold);

		fn(debounced, controller.signal)
			.then((results) => {
				if (controller.signal.aborted) return;
				clearTimeout(stallTimer);
				setStalled(false);
				setState({ results, loading: false, error: null });
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				clearTimeout(stallTimer);
				setStalled(false);
				setState({ results: EMPTY, loading: false, error });
			});

		return () => {
			controller.abort();
			clearTimeout(stallTimer);
		};
	}, [debounced, minLength, stallThreshold, hasSearch]);

	const willSearch = hasSearch && trimmed.length >= minLength;
	const debouncePending = willSearch && debounced !== trimmed;
	const active = willSearch && (debouncePending || state.loading);

	return {
		results: state.results,
		loading: state.loading,
		stalled,
		error: state.error,
		active,
	};
}
