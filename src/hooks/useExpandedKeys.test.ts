import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { collectGroupIds, useExpandedKeys } from "./useExpandedKeys";

const items: NavItemType[] = [
	{ id: "home", type: "link", label: "Home", href: "/" },
	{
		id: "settings",
		type: "group",
		label: "Settings",
		children: [
			{ id: "general", type: "link", label: "General", href: "/g" },
			{
				id: "advanced",
				type: "group",
				label: "Advanced",
				children: [{ id: "danger", type: "link", label: "Danger", href: "/d" }],
			},
		],
	},
	{
		id: "docs",
		type: "group",
		label: "Docs",
		children: [{ id: "intro", type: "link", label: "Intro", href: "/i" }],
	},
];

describe("useExpandedKeys", () => {
	it("starts from the lazy initializer", () => {
		// Arrange

		// Act
		const { result } = renderHook(() =>
			useExpandedKeys(items, () => ["settings"]),
		);

		// Assert
		expect(result.current.expandedKeys).toEqual(new Set(["settings"]));
		expect(result.current.isExpanded("settings")).toBe(true);
		expect(result.current.isExpanded("docs")).toBe(false);
	});

	it("expandGroup adds a key without touching others", () => {
		// Arrange
		const { result } = renderHook(() =>
			useExpandedKeys(items, () => ["settings"]),
		);

		// Act
		act(() => result.current.expandGroup("docs"));

		// Assert
		expect(result.current.expandedKeys).toEqual(new Set(["settings", "docs"]));
	});

	it("collapseGroup removes only the given key", () => {
		// Arrange
		const { result } = renderHook(() =>
			useExpandedKeys(items, () => ["settings", "docs"]),
		);

		// Act
		act(() => result.current.collapseGroup("settings"));

		// Assert
		expect(result.current.expandedKeys).toEqual(new Set(["docs"]));
	});

	it("toggleGroup flips a key both ways", () => {
		// Arrange
		const { result } = renderHook(() => useExpandedKeys(items));
		act(() => result.current.toggleGroup("docs"));
		expect(result.current.isExpanded("docs")).toBe(true);

		// Act
		act(() => result.current.toggleGroup("docs"));

		// Assert
		expect(result.current.isExpanded("docs")).toBe(false);
	});

	it("expandAll opens every group including nested ones", () => {
		// Arrange
		const { result } = renderHook(() => useExpandedKeys(items));

		// Act
		act(() => result.current.expandAll());

		// Assert
		expect(result.current.expandedKeys).toEqual(
			new Set(["settings", "advanced", "docs"]),
		);
	});

	it("collapseAll clears every key", () => {
		// Arrange
		const { result } = renderHook(() =>
			useExpandedKeys(items, () => ["settings", "docs"]),
		);

		// Act
		act(() => result.current.collapseAll());

		// Assert
		expect(result.current.expandedKeys).toEqual(new Set());
	});

	it("setExpandedKeys accepts a functional update", () => {
		// Arrange
		const { result } = renderHook(() =>
			useExpandedKeys(items, () => ["settings"]),
		);

		// Act
		act(() =>
			result.current.setExpandedKeys((prev) => new Set([...prev, "docs"])),
		);

		// Assert
		expect(result.current.expandedKeys).toEqual(new Set(["settings", "docs"]));
	});
});

describe("collectGroupIds", () => {
	it("collects nested group ids in depth-first order", () => {
		// Arrange

		// Act
		const ids = collectGroupIds(items);

		// Assert
		expect(ids).toEqual(["settings", "advanced", "docs"]);
	});
});
