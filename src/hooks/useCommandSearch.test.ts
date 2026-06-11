import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type CommandSearchResult, useCommandSearch } from "./useCommandSearch";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("useCommandSearch", () => {
	it("returns backend results after the debounce", async () => {
		const search = vi.fn(
			async (q: string): Promise<CommandSearchResult[]> => [
				{ id: "1", label: `Hit ${q}`, href: "/h/1" },
			],
		);
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 10, minLength: 2 }),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "abc" });
		await waitFor(() => expect(result.current.results).toHaveLength(1));
		expect(search).toHaveBeenCalledWith("abc", expect.any(AbortSignal));
	});

	it("does not call the backend below minLength", async () => {
		const search = vi.fn(async (): Promise<CommandSearchResult[]> => []);
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 10, minLength: 3 }),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "ab" });
		await delay(40);
		expect(search).not.toHaveBeenCalled();
		expect(result.current.results).toEqual([]);
	});

	it("surfaces errors and clears results", async () => {
		const search = vi.fn(async (): Promise<CommandSearchResult[]> => {
			throw new Error("boom");
		});
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 10, minLength: 2 }),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "xy" });
		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
		expect(result.current.results).toEqual([]);
	});

	it("flags `stalled` once a request exceeds the stall threshold", async () => {
		let resolveFn: (v: CommandSearchResult[]) => void = () => {};
		const search = vi.fn(
			() =>
				new Promise<CommandSearchResult[]>((resolve) => {
					resolveFn = resolve;
				}),
		);
		const { result, rerender } = renderHook(
			({ q }) =>
				useCommandSearch(q, search, {
					debounce: 0,
					minLength: 1,
					stallThreshold: 10,
				}),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "ab" });
		await waitFor(() => expect(result.current.stalled).toBe(true));
		resolveFn([{ id: "1", label: "x", href: "/x" }]);
		await waitFor(() => expect(result.current.stalled).toBe(false));
	});

	it("ignores a superseded (aborted) response so the latest query wins", async () => {
		// Deferred promises make ordering deterministic regardless of wall-clock.
		const deferreds: Array<{
			q: string;
			resolve: (v: CommandSearchResult[]) => void;
			isAborted: () => boolean;
		}> = [];
		const search = vi.fn(
			(q: string, signal: AbortSignal) =>
				new Promise<CommandSearchResult[]>((resolve) => {
					deferreds.push({ q, resolve, isAborted: () => signal.aborted });
				}),
		);
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 5, minLength: 2 }),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "aa" });
		await waitFor(() => expect(deferreds).toHaveLength(1)); // "aa" request fired
		rerender({ q: "bb" });
		await waitFor(() => expect(deferreds).toHaveLength(2)); // "bb" fired, "aa" aborted

		// Resolve the latest first, then the stale (now-aborted) "aa".
		deferreds[1].resolve([{ id: "bb", label: "bb", href: "/bb" }]);
		await waitFor(() =>
			expect(result.current.results.map((r) => r.id)).toEqual(["bb"]),
		);
		deferreds[0].resolve([{ id: "aa", label: "aa", href: "/aa" }]);
		await delay(20);
		expect(result.current.results.map((r) => r.id)).toEqual(["bb"]);
		expect(deferreds[0].isAborted()).toBe(true);
	});

	it("resets `stalled` when a stalled request is superseded", async () => {
		const resolvers: Array<(v: CommandSearchResult[]) => void> = [];
		const search = vi.fn(
			() =>
				new Promise<CommandSearchResult[]>((resolve) => {
					resolvers.push(resolve);
				}),
		);
		const { result, rerender } = renderHook(
			({ q }) =>
				useCommandSearch(q, search, {
					debounce: 5,
					minLength: 1,
					// Long enough that the SECOND request can't legitimately stall
					// before the assertion below runs.
					stallThreshold: 500,
				}),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "ab" });
		await waitFor(() => expect(result.current.stalled).toBe(true), {
			timeout: 2000,
		});

		// Supersede the stalled request: the new one must start un-stalled.
		rerender({ q: "abc" });
		await waitFor(() => expect(search).toHaveBeenCalledTimes(2));
		expect(result.current.stalled).toBe(false);
		for (const resolve of resolvers) resolve([]);
	});

	it("refetches when the search function identity changes", async () => {
		const searchA = vi.fn(
			async (): Promise<CommandSearchResult[]> => [
				{ id: "a", label: "from A", href: "/a" },
			],
		);
		const searchB = vi.fn(
			async (): Promise<CommandSearchResult[]> => [
				{ id: "b", label: "from B", href: "/b" },
			],
		);
		const { result, rerender } = renderHook(
			({ q, fn }) => useCommandSearch(q, fn, { debounce: 5, minLength: 2 }),
			{ initialProps: { q: "ab", fn: searchA } },
		);

		await waitFor(() =>
			expect(result.current.results.map((r) => r.id)).toEqual(["a"]),
		);

		// Same query, new function (e.g. scoped to a different workspace).
		rerender({ q: "ab", fn: searchB });
		await waitFor(() =>
			expect(result.current.results.map((r) => r.id)).toEqual(["b"]),
		);
		expect(searchB).toHaveBeenCalledWith("ab", expect.any(AbortSignal));
	});

	it("routes a synchronously-throwing search fn into the error state", async () => {
		const search = vi.fn((): Promise<CommandSearchResult[]> => {
			throw new Error("sync boom");
		});
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 5, minLength: 2 }),
			{ initialProps: { q: "" } },
		);

		rerender({ q: "ab" });
		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
		expect(result.current.loading).toBe(false);
		expect(result.current.stalled).toBe(false);
	});

	it("keeps previous results when a refresh fails", async () => {
		let fail = false;
		const search = vi.fn(async (): Promise<CommandSearchResult[]> => {
			if (fail) throw new Error("flaky");
			return [{ id: "ok", label: "ok", href: "/ok" }];
		});
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 5, minLength: 2 }),
			{ initialProps: { q: "ab" } },
		);

		await waitFor(() => expect(result.current.results).toHaveLength(1));

		fail = true;
		rerender({ q: "abc" });
		await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
		// Stale-while-revalidate applies to failures too.
		expect(result.current.results.map((r) => r.id)).toEqual(["ok"]);
	});

	it("clears results and error as soon as the live query stops qualifying", async () => {
		const search = vi.fn(
			async (): Promise<CommandSearchResult[]> => [
				{ id: "1", label: "hit", href: "/h" },
			],
		);
		const { result, rerender } = renderHook(
			({ q }) => useCommandSearch(q, search, { debounce: 50, minLength: 2 }),
			{ initialProps: { q: "ab" } },
		);

		await waitFor(() => expect(result.current.results).toHaveLength(1));

		// Drop below minLength: gated immediately, not after the debounce.
		rerender({ q: "a" });
		expect(result.current.results).toEqual([]);
		expect(result.current.error).toBeNull();
		expect(result.current.active).toBe(false);
	});
});
