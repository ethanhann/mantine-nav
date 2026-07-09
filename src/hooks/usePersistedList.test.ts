import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersistedList } from "./usePersistedList";

const KEY = "test-persisted-list";

function fireStorageEvent(key: string, newValue: string | null) {
	window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

describe("usePersistedList cross-tab sync", () => {
	beforeEach(() => {
		localStorage.removeItem(KEY);
	});

	afterEach(() => {
		localStorage.removeItem(KEY);
	});

	it("updates state when a valid array is written from another tab", () => {
		// Arrange
		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
			}),
		);
		expect(result.current.items).toEqual([]);

		// Act
		act(() => {
			localStorage.setItem(KEY, JSON.stringify(["a", "b"]));
			fireStorageEvent(KEY, JSON.stringify(["a", "b"]));
		});

		// Assert
		expect(result.current.items).toEqual(["a", "b"]);
	});

	it("clears state when the key is removed from another tab", () => {
		// Arrange
		localStorage.setItem(KEY, JSON.stringify(["x"]));
		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
			}),
		);
		expect(result.current.items).toEqual(["x"]);

		// Act
		act(() => {
			localStorage.removeItem(KEY);
			fireStorageEvent(KEY, null);
		});

		// Assert
		expect(result.current.items).toEqual([]);
	});

	it("ignores invalid JSON in the storage event", () => {
		// Arrange
		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
			}),
		);

		// Act
		act(() => fireStorageEvent(KEY, "not-valid-json{{{"));

		// Assert
		expect(result.current.items).toEqual([]);
	});

	it("does not echo a storage event update back to localStorage", () => {
		// Arrange
		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
			}),
		);
		const spy = vi.spyOn(Storage.prototype, "setItem");

		// Act
		act(() => {
			fireStorageEvent(KEY, JSON.stringify(["synced"]));
		});

		// Assert
		expect(result.current.items).toEqual(["synced"]);
		const callKeys = spy.mock.calls.map((c) => c[0]);
		expect(callKeys).not.toContain(KEY);
		spy.mockRestore();
	});

	it("does not attach a listener when storageKey is omitted", () => {
		// Arrange
		const spy = vi.spyOn(window, "addEventListener");

		// Act
		renderHook(() => usePersistedList<string>({ getId: (s) => s }));

		// Assert
		const storageCalls = spy.mock.calls.filter((c) => c[0] === "storage");
		expect(storageCalls).toHaveLength(0);
		spy.mockRestore();
	});

	it("ignores storage events for other keys", () => {
		// Arrange
		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
			}),
		);

		// Act
		act(() => fireStorageEvent("other-key", JSON.stringify(["nope"])));

		// Assert
		expect(result.current.items).toEqual([]);
	});

	it("applies the parse validator to storage event values", () => {
		// Arrange
		const parseOnlyStrings = (raw: unknown): string[] =>
			Array.isArray(raw) ? raw.filter((v) => typeof v === "string") : [];

		const { result } = renderHook(() =>
			usePersistedList<string>({
				getId: (s) => s,
				storageKey: KEY,
				parse: parseOnlyStrings,
			}),
		);

		// Act
		act(() => {
			fireStorageEvent(KEY, JSON.stringify(["valid", 123, null, "also-valid"]));
		});

		// Assert
		expect(result.current.items).toEqual(["valid", "also-valid"]);
	});
});
