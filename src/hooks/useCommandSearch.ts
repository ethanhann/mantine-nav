"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { type ReactNode, useEffect, useState } from "react";

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
	/** Latest results for the current input (kept visible while the next
	 * request is in flight, including after a failed refresh; cleared as soon
	 * as the input no longer qualifies for a search). */
	results: CommandSearchResult[];
	/** A request is in flight. */
	loading: boolean;
	/** Loading has exceeded `stallThreshold` — show a spinner. */
	stalled: boolean;
	/** The last completed request for the current input rejected. */
	error: unknown;
	/** A search is pending or running for the current input — use this to
	 * suppress the empty state instead of flashing "nothing found". */
	active: boolean;
}

interface SearchState {
	results: CommandSearchResult[];
	loading: boolean;
	error: unknown;
	/** The debounced query the current results/error settled for. Covers the
	 * frame between the debounced value committing and the (post-commit)
	 * effect flipping `loading` on, so `active` never gaps to false. */
	settledFor: string | null;
}

const EMPTY: CommandSearchResult[] = [];
// Single idle reference so reset setStates bail out (Object.is) instead of
// forcing a re-render per settled keystroke when there is nothing to search.
const IDLE: SearchState = {
	results: EMPTY,
	loading: false,
	error: null,
	settledFor: null,
};

/**
 * Headless backend-search driver for the command palette. Debounces the query,
 * cancels superseded requests, keeps previous results visible while loading
 * (stale-while-revalidate, on failure too), and gates the spinner behind a
 * stall threshold.
 *
 * The `search` function is an effect dependency: swapping in a different
 * function (e.g. one scoped to a newly selected workspace) refetches the
 * current query. Memoize it (`useCallback`) — an unmemoized inline function
 * costs a superseded request per parent render while a query is active.
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
	const hasSearch = typeof search === "function";
	// Feed the debouncer a constant when there is nothing to search so it
	// schedules no timers and produces no settle re-renders.
	const [debounced] = useDebouncedValue(hasSearch ? trimmed : "", debounce);
	const [state, setState] = useState<SearchState>(IDLE);
	const [stalled, setStalled] = useState(false);

	useEffect(() => {
		if (!search || debounced.length < minLength) {
			setState((prev) => (prev === IDLE ? prev : IDLE));
			setStalled(false);
			return;
		}

		const controller = new AbortController();
		// A new request always starts un-stalled, even when it supersedes a
		// request that had already tripped the spinner.
		setStalled(false);
		// Stale-while-revalidate: keep prior results, just flip loading on.
		setState((prev) =>
			prev.loading && prev.error == null
				? prev
				: { ...prev, loading: true, error: null },
		);
		const stallTimer = setTimeout(() => setStalled(true), stallThreshold);

		// Promise.resolve().then(...) routes a synchronously-throwing search fn
		// into the rejection path instead of letting it escape the effect.
		Promise.resolve()
			.then(() => search(debounced, controller.signal))
			.then(
				(results) => {
					if (controller.signal.aborted) return;
					clearTimeout(stallTimer);
					setStalled(false);
					setState({
						results,
						loading: false,
						error: null,
						settledFor: debounced,
					});
				},
				(error) => {
					if (controller.signal.aborted) return;
					clearTimeout(stallTimer);
					setStalled(false);
					// Keep prior results: a transient failure shouldn't blank the list.
					setState((prev) => ({
						results: prev.results,
						loading: false,
						error,
						settledFor: debounced,
					}));
				},
			);

		return () => {
			controller.abort();
			clearTimeout(stallTimer);
		};
	}, [debounced, minLength, stallThreshold, search]);

	const willSearch = hasSearch && trimmed.length >= minLength;
	const debouncePending = willSearch && debounced !== trimmed;
	const active =
		willSearch &&
		(debouncePending || state.loading || state.settledFor !== debounced);

	// Gate returned data on the live input so stale results/errors never leak
	// into a query they don't belong to (cleared input, below-minLength) while
	// the debounced value lags behind.
	return {
		results: willSearch ? state.results : EMPTY,
		loading: state.loading,
		stalled: willSearch && stalled,
		error: willSearch ? state.error : null,
		active,
	};
}
