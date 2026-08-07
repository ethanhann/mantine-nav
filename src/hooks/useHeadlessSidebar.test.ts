import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { useHeadlessSidebar } from "./useHeadlessSidebar";

const items: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{
		type: "group",
		id: "settings",
		label: "Settings",
		children: [
			{ type: "link", id: "profile", label: "Profile", href: "/profile" },
		],
	},
];

describe("Spec 046: useHeadlessSidebar", () => {
	it("returns items and state", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		expect(result.current.items).toBe(items);
		expect(result.current.collapsed).toBe(false);
		expect(result.current.variant).toBe("full");
	});

	it("toggleGroup works", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		act(() => result.current.toggleGroup("settings"));
		expect(result.current.expandedKeys.has("settings")).toBe(true);
		act(() => result.current.toggleGroup("settings"));
		expect(result.current.expandedKeys.has("settings")).toBe(false);
	});

	it("setCollapsed and toggleCollapsed work", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		act(() => result.current.setCollapsed(true));
		expect(result.current.collapsed).toBe(true);
		act(() => result.current.toggleCollapsed());
		expect(result.current.collapsed).toBe(false);
	});

	it("setVariant works", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		act(() => result.current.setVariant("rail"));
		expect(result.current.variant).toBe("rail");
	});

	it("getRootProps returns tree role", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		const props = result.current.getRootProps();
		expect(props.role).toBe("tree");
		expect(props["aria-label"]).toBe("Navigation");
	});

	it("getItemProps returns correct attributes", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		const linkProps = result.current.getItemProps(items[0]!);
		expect(linkProps.role).toBe("treeitem");

		const groupProps = result.current.getItemProps(items[1]!);
		expect(groupProps["aria-expanded"]).toBe(false);
	});

	it("setActiveItem updates state", () => {
		const { result } = renderHook(() => useHeadlessSidebar({ items }));
		act(() => result.current.setActiveItem("home"));
		expect(result.current.activeItemId).toBe("home");
	});
});

const nestedItems: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{ type: "link", id: "docs", label: "Docs", href: "/docs" },
	{
		type: "link",
		id: "billing",
		label: "Billing",
		href: "/billing",
		disabled: true,
	},
	{
		type: "group",
		id: "settings",
		label: "Settings",
		children: [
			{ type: "link", id: "profile", label: "Profile", href: "/profile" },
			{
				type: "group",
				id: "advanced",
				label: "Advanced",
				children: [
					{ type: "link", id: "tokens", label: "Tokens", href: "/tokens" },
				],
			},
		],
	},
];

const [homeItem, docsItem, billingItem, settingsItem] = nestedItems as [
	NavItemType,
	NavItemType,
	NavItemType,
	NavItemType,
];

describe("useHeadlessSidebar prop getters", () => {
	it("marks the active link with aria-current and data-active", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		act(() => result.current.setActiveItem("home"));

		// Act
		const props = result.current.getItemProps(homeItem);

		// Assert
		expect(props["aria-current"]).toBe("page");
		expect(props["data-active"]).toBe(true);
		expect(props.role).toBe("treeitem");
	});

	it("leaves aria-current and data-active off a link that is not active", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		act(() => result.current.setActiveItem("home"));

		// Act
		const props = result.current.getItemProps(docsItem);

		// Assert
		expect(props["aria-current"]).toBeUndefined();
		expect(props["data-active"]).toBeUndefined();
	});

	it("marks an active group with data-active but never aria-current", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		act(() => result.current.setActiveItem("settings"));

		// Act
		const props = result.current.getItemProps(settingsItem);

		// Assert
		expect(props["data-active"]).toBe(true);
		expect(props["aria-current"]).toBeUndefined();
	});

	it("omits aria-expanded for link items", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getItemProps(homeItem);

		// Assert
		expect(props["aria-expanded"]).toBeUndefined();
	});

	it("reports aria-expanded false for a collapsed group", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getItemProps(settingsItem);

		// Assert
		expect(props["aria-expanded"]).toBe(false);
	});

	it("reports aria-expanded true once the group expands", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		act(() => result.current.expandGroup("settings"));

		// Act
		const props = result.current.getItemProps(settingsItem);

		// Assert
		expect(props["aria-expanded"]).toBe(true);
	});

	it("assigns a roving tabIndex of -1", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getItemProps(homeItem);

		// Assert
		expect(props.tabIndex).toBe(-1);
	});

	it("flags a disabled item with data-disabled", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getItemProps(billingItem);

		// Assert
		expect(props["data-disabled"]).toBe(true);
	});

	it("leaves data-disabled off an enabled item", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getItemProps(homeItem);

		// Assert
		expect(props["data-disabled"]).toBeUndefined();
	});

	it("reflects a newly set active item on the next call", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		expect(
			result.current.getItemProps(docsItem)["data-active"],
		).toBeUndefined();

		// Act
		act(() => result.current.setActiveItem("docs"));

		// Assert
		expect(result.current.getItemProps(docsItem)["data-active"]).toBe(true);
		expect(result.current.getItemProps(docsItem)["aria-current"]).toBe("page");
	});

	it("getGroupProps returns the group role", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getGroupProps(settingsItem);

		// Assert
		expect(props).toEqual({ role: "group" });
	});

	it("getRootProps returns a labelled tree role", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		const props = result.current.getRootProps();

		// Assert
		expect(props).toEqual({ role: "tree", "aria-label": "Navigation" });
	});

	it("keeps stateless callbacks referentially stable across renders", () => {
		// Arrange
		const { result, rerender } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);
		const before = {
			toggleCollapsed: result.current.toggleCollapsed,
			getGroupProps: result.current.getGroupProps,
			getRootProps: result.current.getRootProps,
		};

		// Act
		rerender();

		// Assert
		expect(result.current.toggleCollapsed).toBe(before.toggleCollapsed);
		expect(result.current.getGroupProps).toBe(before.getGroupProps);
		expect(result.current.getRootProps).toBe(before.getRootProps);
	});
});

describe("useHeadlessSidebar expansion state", () => {
	it("starts with nothing expanded when defaultExpanded is omitted", () => {
		// Arrange, Act
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Assert
		expect(result.current.expandedKeys.size).toBe(0);
	});

	it("honors defaultExpanded on mount", () => {
		// Arrange, Act
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems, defaultExpanded: ["settings"] }),
		);

		// Assert
		expect(result.current.expandedKeys.has("settings")).toBe(true);
		expect(result.current.expandedKeys.size).toBe(1);
	});

	it("expandAll expands every group including nested ones", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({ items: nestedItems }),
		);

		// Act
		act(() => result.current.expandAll());

		// Assert
		expect(result.current.expandedKeys.has("settings")).toBe(true);
		expect(result.current.expandedKeys.has("advanced")).toBe(true);
		expect(result.current.expandedKeys.size).toBe(2);
	});

	it("collapseAll empties the expanded set", () => {
		// Arrange
		const { result } = renderHook(() =>
			useHeadlessSidebar({
				items: nestedItems,
				defaultExpanded: ["settings", "advanced"],
			}),
		);

		// Act
		act(() => result.current.collapseAll());

		// Assert
		expect(result.current.expandedKeys.size).toBe(0);
	});

	it("honors defaultCollapsed and defaultVariant", () => {
		// Arrange, Act
		const { result } = renderHook(() =>
			useHeadlessSidebar({
				items: nestedItems,
				defaultCollapsed: true,
				defaultVariant: "rail",
			}),
		);

		// Assert
		expect(result.current.collapsed).toBe(true);
		expect(result.current.variant).toBe("rail");
	});
});
