import { act, renderHook } from "@testing-library/react";
import { createElement, StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRecentlyViewed } from "./useRecentlyViewed";

describe("Spec 030: useRecentlyViewed", () => {
	it("starts empty", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: "test-recent" }),
		);
		expect(result.current.items.length).toBe(0);
	});

	it("adds items with timestamp", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: "test-recent-add" }),
		);
		act(() =>
			result.current.addItem({ id: "1", label: "Page 1", href: "/page1" }),
		);
		expect(result.current.items.length).toBe(1);
		expect(result.current.items[0]!.label).toBe("Page 1");
		expect(result.current.items[0]!.timestamp).toBeGreaterThan(0);
	});

	it("removes duplicates and moves to front", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: "test-recent-dedup" }),
		);
		act(() =>
			result.current.addItem({ id: "1", label: "Page 1", href: "/p1" }),
		);
		act(() =>
			result.current.addItem({ id: "2", label: "Page 2", href: "/p2" }),
		);
		act(() =>
			result.current.addItem({ id: "1", label: "Page 1", href: "/p1" }),
		);
		expect(result.current.items.length).toBe(2);
		expect(result.current.items[0]!.id).toBe("1");
	});

	it("respects maxItems", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ maxItems: 2, storageKey: "test-recent-max" }),
		);
		act(() => result.current.addItem({ id: "1", label: "P1", href: "/1" }));
		act(() => result.current.addItem({ id: "2", label: "P2", href: "/2" }));
		act(() => result.current.addItem({ id: "3", label: "P3", href: "/3" }));
		expect(result.current.items.length).toBe(2);
		expect(result.current.items[0]!.id).toBe("3");
	});

	it("removeItem removes a specific item", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: "test-recent-remove" }),
		);
		act(() => result.current.addItem({ id: "1", label: "P1", href: "/1" }));
		act(() => result.current.addItem({ id: "2", label: "P2", href: "/2" }));
		act(() => result.current.removeItem("1"));
		expect(result.current.items.length).toBe(1);
		expect(result.current.items[0]!.id).toBe("2");
	});

	it("persists to localStorage", () => {
		const key = "test-recent-persist";
		localStorage.removeItem(key);

		const { result } = renderHook(() => useRecentlyViewed({ storageKey: key }));
		act(() => result.current.addItem({ id: "1", label: "P1", href: "/1" }));
		const stored = JSON.parse(localStorage.getItem(key) || "[]");
		expect(stored.length).toBe(1);
		expect(stored[0].id).toBe("1");

		localStorage.removeItem(key);
	});

	it("loads initial state from localStorage", () => {
		const key = "test-recent-load";
		const data = [{ id: "x", label: "X", href: "/x", timestamp: 1000 }];
		localStorage.setItem(key, JSON.stringify(data));

		const { result } = renderHook(() => useRecentlyViewed({ storageKey: key }));
		expect(result.current.items.length).toBe(1);
		expect(result.current.items[0]!.id).toBe("x");

		localStorage.removeItem(key);
	});

	it("handles corrupt localStorage data gracefully", () => {
		const key = "test-recent-corrupt";
		localStorage.setItem(key, "not-valid-json");

		const { result } = renderHook(() => useRecentlyViewed({ storageKey: key }));
		expect(result.current.items.length).toBe(0);

		localStorage.removeItem(key);
	});

	it("clearAll removes all items", () => {
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: "test-recent-clear" }),
		);
		act(() => result.current.addItem({ id: "1", label: "P1", href: "/1" }));
		act(() => result.current.clearAll());
		expect(result.current.items.length).toBe(0);
	});

	it("writes to storage exactly once per add under StrictMode", () => {
		// Arrange
		const key = "test-recent-strict";
		localStorage.removeItem(key);
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");
		const { result } = renderHook(
			() => useRecentlyViewed({ storageKey: key }),
			{
				wrapper: ({ children }) => createElement(StrictMode, null, children),
			},
		);
		setItemSpy.mockClear();

		// Act
		act(() => result.current.addItem({ id: "1", label: "P1", href: "/1" }));

		// Assert
		expect(setItemSpy).toHaveBeenCalledTimes(1);
		setItemSpy.mockRestore();
		localStorage.removeItem(key);
	});

	it("trims a stored list longer than maxItems on load", () => {
		// Arrange
		const key = "test-recent-trim";
		const data = Array.from({ length: 5 }, (_, i) => ({
			id: String(i),
			label: `P${i}`,
			href: `/${i}`,
			timestamp: 1000 + i,
		}));
		localStorage.setItem(key, JSON.stringify(data));

		// Act
		const { result } = renderHook(() =>
			useRecentlyViewed({ storageKey: key, maxItems: 3 }),
		);

		// Assert
		expect(result.current.items.length).toBe(3);
		localStorage.removeItem(key);
	});
});
