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
});
