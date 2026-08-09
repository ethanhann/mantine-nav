import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { useNavBreadcrumbs } from "./useNavBreadcrumbs";

const items: NavItemType[] = [
	{
		type: "link",
		id: "home",
		label: "Home",
		href: "/",
		activeExact: true,
	},
	{
		type: "group",
		id: "settings",
		label: "Settings",
		icon: "settings-icon",
		children: [
			{
				type: "link",
				id: "general",
				label: "General",
				href: "/settings/general",
			},
			{
				type: "group",
				id: "advanced",
				label: "Advanced",
				children: [
					{
						type: "link",
						id: "danger",
						label: "Danger Zone",
						href: "/settings/advanced/danger",
					},
				],
			},
		],
	},
	{ type: "section", id: "sec", label: "Other" },
	{ type: "divider", id: "div" },
	{
		type: "link",
		id: "about",
		label: "About",
		href: "/about",
	},
];

describe("useNavBreadcrumbs", () => {
	it("returns a single entry for a flat link match", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/about" }),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(1);
		expect(result.current.breadcrumbs[0]).toMatchObject({
			id: "about",
			label: "About",
			href: "/about",
			isCurrentPage: true,
		});
		expect(result.current.activeItem?.id).toBe("about");
	});

	it("returns the full ancestor chain for a deeply nested item", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items,
				currentPath: "/settings/advanced/danger",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(3);
		expect(result.current.breadcrumbs.map((b) => b.id)).toEqual([
			"settings",
			"advanced",
			"danger",
		]);
		expect(result.current.breadcrumbs[0]!.isCurrentPage).toBe(false);
		expect(result.current.breadcrumbs[1]!.isCurrentPage).toBe(false);
		expect(result.current.breadcrumbs[2]!.isCurrentPage).toBe(true);
	});

	it("prepends rootEntry when provided", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items,
				currentPath: "/settings/general",
				rootEntry: { label: "Home", href: "/" },
			}),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(3);
		expect(result.current.breadcrumbs[0]).toMatchObject({
			id: "__root__",
			label: "Home",
			href: "/",
			isCurrentPage: false,
		});
		expect(result.current.breadcrumbs[1]!.id).toBe("settings");
		expect(result.current.breadcrumbs[2]!.id).toBe("general");
	});

	it("returns an empty array when no item matches", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/nonexistent" }),
		);

		// Assert
		expect(result.current.breadcrumbs).toEqual([]);
		expect(result.current.activeItem).toBeNull();
	});

	it("skips invisible items", () => {
		// Arrange
		const hiddenItems: NavItemType[] = [
			{
				type: "group",
				id: "g1",
				label: "Group",
				children: [
					{
						type: "link",
						id: "visible",
						label: "Visible",
						href: "/visible",
					},
					{
						type: "link",
						id: "hidden",
						label: "Hidden",
						href: "/hidden",
						visible: false,
					},
				],
			},
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items: hiddenItems, currentPath: "/hidden" }),
		);

		// Assert
		expect(result.current.breadcrumbs).toEqual([]);
	});

	it("includes a group with its own href as the active item", () => {
		// Arrange
		const groupWithHref: NavItemType[] = [
			{
				type: "group",
				id: "docs",
				label: "Docs",
				href: "/docs",
				children: [
					{
						type: "link",
						id: "api",
						label: "API",
						href: "/docs/api",
					},
				],
			},
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items: groupWithHref,
				currentPath: "/docs",
				matcher: "exact",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(1);
		expect(result.current.breadcrumbs[0]).toMatchObject({
			id: "docs",
			label: "Docs",
			href: "/docs",
			isCurrentPage: true,
		});
	});

	it("respects per-item activeExact override", () => {
		// Arrange
		const exactItems: NavItemType[] = [
			{
				type: "link",
				id: "root",
				label: "Root",
				href: "/",
				activeExact: true,
			},
			{
				type: "link",
				id: "child",
				label: "Child",
				href: "/child",
			},
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items: exactItems,
				currentPath: "/child",
				matcher: "prefix",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(1);
		expect(result.current.breadcrumbs[0]!.id).toBe("child");
	});

	it("longest href wins when multiple items match via prefix", () => {
		// Arrange
		const prefixItems: NavItemType[] = [
			{
				type: "group",
				id: "parent",
				label: "Parent",
				href: "/app",
				children: [
					{
						type: "link",
						id: "child",
						label: "Child",
						href: "/app/child",
					},
				],
			},
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items: prefixItems,
				currentPath: "/app/child",
				matcher: "prefix",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(2);
		expect(result.current.breadcrumbs[1]!.id).toBe("child");
		expect(result.current.breadcrumbs[1]!.isCurrentPage).toBe(true);
	});

	it("updates breadcrumbs when currentPath changes", () => {
		// Arrange
		let path = "/about";
		const { result, rerender } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: path }),
		);
		expect(result.current.breadcrumbs[0]!.id).toBe("about");

		// Act
		path = "/settings/general";
		rerender();

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(2);
		expect(result.current.breadcrumbs.map((b) => b.id)).toEqual([
			"settings",
			"general",
		]);
	});

	it("carries icon from ancestor group items", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items,
				currentPath: "/settings/general",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs[0]!.icon).toBe("settings-icon");
	});

	it("exposes the original item on each entry", () => {
		// Arrange / Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({
				items,
				currentPath: "/settings/general",
			}),
		);

		// Assert
		expect(result.current.breadcrumbs[0]!.item).toMatchObject({
			type: "group",
			id: "settings",
			label: "Settings",
		});
		expect(result.current.breadcrumbs[1]!.item).toMatchObject({
			type: "link",
			id: "general",
			label: "General",
		});
	});
});

describe("useNavBreadcrumbs action items", () => {
	it("never puts an action item in the trail", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "signout", label: "Sign out", onClick: () => {} },
			{ type: "link", id: "home", label: "Home", href: "/" },
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/" }),
		);

		// Assert
		expect(result.current.breadcrumbs.map((c) => c.id)).not.toContain(
			"signout",
		);
		expect(result.current.activeItem?.id).toBe("home");
	});
});

describe("useNavBreadcrumbs href guards", () => {
	it("never offers an action item to a custom matcher", () => {
		// Arrange
		const matcher = vi.fn(() => true);
		const items: NavItemType[] = [
			{ type: "link", id: "signout", label: "Sign out", onClick: () => {} },
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/", matcher }),
		);

		// Assert
		expect(result.current.breadcrumbs).toHaveLength(0);
		expect(matcher).not.toHaveBeenCalled();
	});

	it("never offers a group without an href to a custom matcher", () => {
		// Arrange
		const matcher = vi.fn(() => false);
		const items: NavItemType[] = [
			{
				type: "group",
				id: "products",
				label: "Products",
				children: [
					{ type: "link", id: "catalog", label: "Catalog", href: "/catalog" },
				],
			},
		];

		// Act
		renderHook(() => useNavBreadcrumbs({ items, currentPath: "/x", matcher }));

		// Assert
		expect(matcher).toHaveBeenCalledTimes(1);
		expect(matcher).toHaveBeenCalledWith("/x", "/catalog");
	});

	it("keeps the first of two equally specific link matches", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "first", label: "First", href: "/shared" },
			{ type: "link", id: "second", label: "Second", href: "/shared" },
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/shared" }),
		);

		// Assert
		expect(result.current.activeItem?.id).toBe("first");
	});

	it("keeps the first of two equally specific group matches", () => {
		// Arrange
		const group = (id: string): NavItemType => ({
			type: "group",
			id,
			label: id,
			href: "/shared",
			children: [
				{ type: "link", id: `${id}-child`, label: "Child", href: "/deep" },
			],
		});
		const items: NavItemType[] = [group("first"), group("second")];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/shared" }),
		);

		// Assert
		expect(result.current.breadcrumbs[0]?.id).toBe("first");
	});

	it("prefers the longest matching href", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "short", label: "Short", href: "/a" },
			{ type: "link", id: "long", label: "Long", href: "/a/b" },
		];

		// Act
		const { result } = renderHook(() =>
			useNavBreadcrumbs({ items, currentPath: "/a/b" }),
		);

		// Assert
		expect(result.current.activeItem?.id).toBe("long");
	});
});
