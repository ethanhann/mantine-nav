import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { useActiveNavItem } from "./useActiveNavItem";

const items: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/", activeExact: true },
	{ type: "link", id: "settings", label: "Settings", href: "/settings" },
	{
		type: "group",
		id: "admin",
		label: "Admin",
		children: [
			{ type: "link", id: "users", label: "Users", href: "/admin/users" },
			{ type: "link", id: "roles", label: "Roles", href: "/admin/roles" },
		],
	},
	{
		type: "link",
		id: "settings-old",
		label: "Old Settings",
		href: "/settings-old",
	},
];

describe("Spec 005: useActiveNavItem", () => {
	it("exact matching: only /settings matches /settings", () => {
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/settings", matcher: "exact" }),
		);
		expect(result.current.activeItem?.id).toBe("settings");
		expect(result.current.activeHref).toBe("/settings");
	});

	it("prefix matching: /settings matches /settings/team but not /settings-old", () => {
		const { result } = renderHook(() =>
			useActiveNavItem(items, {
				currentPath: "/settings/team",
				matcher: "prefix",
			}),
		);
		expect(result.current.activeItem?.id).toBe("settings");

		const { result: result2 } = renderHook(() =>
			useActiveNavItem(items, {
				currentPath: "/settings-old",
				matcher: "prefix",
			}),
		);
		expect(result2.current.activeItem?.id).toBe("settings-old");
	});

	it("most specific match wins when multiple items match", () => {
		const { result } = renderHook(() =>
			useActiveNavItem(items, {
				currentPath: "/admin/users",
				matcher: "prefix",
			}),
		);
		expect(result.current.activeItem?.id).toBe("users");
	});

	it("custom function matcher is called correctly", () => {
		const customMatcher = (current: string, href: string) =>
			current.endsWith(href.split("/").pop()!);

		const { result } = renderHook(() =>
			useActiveNavItem(items, {
				currentPath: "/anything/users",
				matcher: customMatcher,
			}),
		);
		// /anything/users ends with 'users', matches /admin/users (href ends with 'users')
		expect(result.current.activeItem).not.toBeNull();
	});

	it("regex matching works with custom patterns", () => {
		const regexItems: NavItemType[] = [
			{
				type: "link",
				id: "r1",
				label: "Projects",
				href: "/projects",
				activeMatch: /^\/projects(\/.*)?$/,
			},
		];
		const { result } = renderHook(() =>
			useActiveNavItem(regexItems, { currentPath: "/projects/123" }),
		);
		expect(result.current.activeItem?.id).toBe("r1");
	});

	it("parent groups are active when child is active", () => {
		const { result } = renderHook(() =>
			useActiveNavItem(items, {
				currentPath: "/admin/users",
				matcher: "prefix",
			}),
		);
		const adminGroup = items[2]!;
		expect(result.current.isActive(adminGroup)).toBe(true);
	});

	it("returns null when no match", () => {
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/unknown" }),
		);
		expect(result.current.activeItem).toBeNull();
		expect(result.current.activeHref).toBeNull();
	});

	it("group with activeExact href does not prefix-match everything", () => {
		const groupItems: NavItemType[] = [
			{
				type: "group",
				id: "root",
				label: "Root",
				href: "/",
				activeExact: true,
				children: [
					{ type: "link", id: "child", label: "Child", href: "/child" },
				],
			},
		];
		const { result } = renderHook(() =>
			useActiveNavItem(groupItems, {
				currentPath: "/child",
				matcher: "prefix",
			}),
		);
		// The synthesized link for the group's "/" href must respect activeExact,
		// so it should NOT become the active item for "/child".
		expect(result.current.activeItem?.id).not.toBe("root");
	});

	it("group is active when its own href matches", () => {
		const groupItems: NavItemType[] = [
			{
				type: "group",
				id: "settings",
				label: "Settings",
				href: "/settings",
				children: [
					{
						type: "link",
						id: "profile",
						label: "Profile",
						href: "/settings/profile",
					},
				],
			},
		];
		const { result } = renderHook(() =>
			useActiveNavItem(groupItems, {
				currentPath: "/settings",
				matcher: "prefix",
			}),
		);
		expect(result.current.isActive(groupItems[0]!)).toBe(true);
	});

	it("malformed regex href does not crash the nav", () => {
		const badItems: NavItemType[] = [
			{
				type: "link",
				id: "bad",
				label: "Bad",
				href: "/settings?tab=1(",
				activeMatch: "regex",
			},
		];
		expect(() =>
			renderHook(() =>
				useActiveNavItem(badItems, { currentPath: "/settings?tab=1(" }),
			),
		).not.toThrow();
	});

	it("activeExact on individual item overrides default matcher", () => {
		// Home has activeExact=true, so prefix matching should still be exact for it
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/home-page", matcher: "prefix" }),
		);
		// '/' with activeExact should NOT match '/home-page'
		const homeItem = items[0]!;
		expect(result.current.isActive(homeItem)).toBe(false);
	});
});

describe("useActiveNavItem action items", () => {
	it("never resolves an action item as active", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "signout", label: "Sign out", onClick: () => {} },
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/" }),
		);

		// Assert
		expect(result.current.activeItem).toBeNull();
		expect(result.current.isActive(items[0]!)).toBe(false);
	});
});

describe("useActiveNavItem href guards", () => {
	it("never offers an action item to a custom matcher", () => {
		// Arrange
		const matcher = vi.fn(() => true);
		const items: NavItemType[] = [
			{ type: "link", id: "signout", label: "Sign out", onClick: () => {} },
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/", matcher }),
		);

		// Assert
		expect(result.current.activeItem).toBeNull();
		expect(result.current.isActive(items[0]!)).toBe(false);
		expect(matcher).not.toHaveBeenCalled();
	});

	it("treats a group with its own href as matchable", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				type: "group",
				id: "products",
				label: "Products",
				href: "/products",
				children: [
					{ type: "link", id: "catalog", label: "Catalog", href: "/catalog" },
				],
			},
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/products" }),
		);

		// Assert
		expect(result.current.activeItem?.id).toBe("products");
		expect(result.current.isActive(items[0]!)).toBe(true);
	});

	it("leaves a group inactive when neither it nor its children match", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				type: "group",
				id: "products",
				label: "Products",
				href: "/products",
				children: [
					{ type: "link", id: "catalog", label: "Catalog", href: "/catalog" },
				],
			},
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/elsewhere" }),
		);

		// Assert
		expect(result.current.isActive(items[0]!)).toBe(false);
	});

	it("keeps the first of two equally specific matches", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "first", label: "First", href: "/shared" },
			{ type: "link", id: "second", label: "Second", href: "/shared" },
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/shared" }),
		);

		// Assert
		expect(result.current.activeItem?.id).toBe("first");
	});

	it("prefers the longest matching href", () => {
		// Arrange
		const items: NavItemType[] = [
			{ type: "link", id: "short", label: "Short", href: "/a" },
			{ type: "link", id: "long", label: "Long", href: "/a/b" },
		];

		// Act
		const { result } = renderHook(() =>
			useActiveNavItem(items, { currentPath: "/a/b" }),
		);

		// Assert
		expect(result.current.activeItem?.id).toBe("long");
	});
});
