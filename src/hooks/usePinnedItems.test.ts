import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { usePinnedItems } from "./usePinnedItems";

const items: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{ type: "link", id: "settings", label: "Settings", href: "/settings" },
	{ type: "link", id: "profile", label: "Profile", href: "/profile" },
];

describe("Spec 004: usePinnedItems", () => {
	it("starts with no pinned items", () => {
		const { result } = renderHook(() => usePinnedItems(items));
		expect(result.current.pinnedItems.length).toBe(0);
		expect(result.current.canPin).toBe(true);
	});

	it("pin and unpin work", () => {
		const { result } = renderHook(() => usePinnedItems(items));

		act(() => result.current.pin(items[0]!));
		expect(result.current.isPinned("home")).toBe(true);
		expect(result.current.pinnedItems.length).toBe(1);

		act(() => result.current.unpin("home"));
		expect(result.current.isPinned("home")).toBe(false);
		expect(result.current.pinnedItems.length).toBe(0);
	});

	it("togglePin works", () => {
		const { result } = renderHook(() => usePinnedItems(items));

		act(() => result.current.togglePin(items[0]!));
		expect(result.current.isPinned("home")).toBe(true);

		act(() => result.current.togglePin(items[0]!));
		expect(result.current.isPinned("home")).toBe(false);
	});

	it("respects maxPinned", () => {
		const { result } = renderHook(() =>
			usePinnedItems(items, { maxPinned: 2 }),
		);

		act(() => result.current.pin(items[0]!));
		act(() => result.current.pin(items[1]!));
		expect(result.current.canPin).toBe(false);

		// Trying to pin another should be a no-op
		act(() => result.current.pin(items[2]!));
		expect(result.current.pinnedItems.length).toBe(2);
	});

	it("does not pin a duplicate item", () => {
		const { result } = renderHook(() => usePinnedItems(items));

		act(() => result.current.pin(items[0]!));
		act(() => result.current.pin(items[0]!));
		expect(result.current.pinnedItems.length).toBe(1);
	});

	it("persists to localStorage when storageKey is provided", () => {
		const key = "test-pinned-persist";
		localStorage.removeItem(key);

		const { result } = renderHook(() =>
			usePinnedItems(items, { storageKey: key }),
		);

		act(() => result.current.pin(items[0]!));
		const stored = JSON.parse(localStorage.getItem(key) || "[]");
		expect(stored).toEqual(["home"]);
	});

	it("loads initial state from localStorage", () => {
		const key = "test-pinned-load";
		localStorage.setItem(key, JSON.stringify(["settings"]));

		const { result } = renderHook(() =>
			usePinnedItems(items, { storageKey: key }),
		);

		expect(result.current.isPinned("settings")).toBe(true);
		expect(result.current.pinnedItems.length).toBe(1);

		localStorage.removeItem(key);
	});

	it("handles invalid localStorage data gracefully", () => {
		const key = "test-pinned-corrupt";
		localStorage.setItem(key, "not-json!!!");

		const { result } = renderHook(() =>
			usePinnedItems(items, { storageKey: key }),
		);

		expect(result.current.pinnedItems.length).toBe(0);

		localStorage.removeItem(key);
	});

	it("handles non-array localStorage data gracefully", () => {
		const key = "test-pinned-object";
		localStorage.setItem(key, JSON.stringify({ foo: "bar" }));

		const { result } = renderHook(() =>
			usePinnedItems(items, { storageKey: key }),
		);

		expect(result.current.pinnedItems.length).toBe(0);

		localStorage.removeItem(key);
	});

	it("reorderPinned works", () => {
		const { result } = renderHook(() => usePinnedItems(items));

		act(() => result.current.pin(items[0]!));
		act(() => result.current.pin(items[1]!));
		act(() => result.current.pin(items[2]!));

		act(() => result.current.reorderPinned(0, 2));
		expect(result.current.pinnedItems.map((i) => i.id)).toEqual([
			"settings",
			"profile",
			"home",
		]);
	});
	it("accepts maxItems as the canonical cap option", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "a", label: "A", href: "/a" },
			{ type: "link", id: "b", label: "B", href: "/b" },
		];
		const { result } = renderHook(() => usePinnedItems(items, { maxItems: 1 }));
		act(() => result.current.pin(items[0]!));

		// Act
		act(() => result.current.pin(items[1]!));

		// Assert
		expect(result.current.pinnedItems.map((i) => i.id)).toEqual(["a"]);
		expect(result.current.canPin).toBe(false);
	});
});
