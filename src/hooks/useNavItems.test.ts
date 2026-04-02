import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { useNavItems } from "./useNavItems";

const items: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{
		type: "group",
		id: "settings",
		label: "Settings",
		defaultOpened: true,
		children: [
			{
				type: "link",
				id: "profile",
				label: "Profile",
				href: "/settings/profile",
			},
			{
				type: "link",
				id: "account",
				label: "Account",
				href: "/settings/account",
			},
		],
	},
	{
		type: "group",
		id: "admin",
		label: "Admin",
		children: [
			{ type: "link", id: "users", label: "Users", href: "/admin/users" },
		],
	},
];

describe("useNavItems", () => {
	it("returns correct flatItems (respecting open/closed state)", () => {
		const { result } = renderHook(() => useNavItems(items));
		// settings is defaultOpened, admin is not
		// flat: home, settings, profile, account, admin
		expect(result.current.flatItems.length).toBe(5);
		expect(result.current.flatItems.map((i) => i.id)).toEqual([
			"home",
			"settings",
			"profile",
			"account",
			"admin",
		]);
	});

	it("expandedKeys reflects defaultOpened", () => {
		const { result } = renderHook(() => useNavItems(items));
		expect(result.current.expandedKeys.has("settings")).toBe(true);
		expect(result.current.expandedKeys.has("admin")).toBe(false);
	});

	it("toggleGroup works", () => {
		const { result } = renderHook(() => useNavItems(items));
		act(() => result.current.toggleGroup("admin"));
		expect(result.current.expandedKeys.has("admin")).toBe(true);
		expect(result.current.flatItems.length).toBe(6); // now includes users
	});

	it("expandAll / collapseAll work", () => {
		const { result } = renderHook(() => useNavItems(items));
		act(() => result.current.expandAll());
		expect(result.current.expandedKeys.has("settings")).toBe(true);
		expect(result.current.expandedKeys.has("admin")).toBe(true);

		act(() => result.current.collapseAll());
		expect(result.current.expandedKeys.size).toBe(0);
		// flat: home, settings, admin (children hidden)
		expect(result.current.flatItems.length).toBe(3);
	});

	it("flatItems excludes invisible items", () => {
		const itemsWithHidden: NavItemType[] = [
			{ type: "link", id: "home", label: "Home", href: "/" },
			{
				type: "link",
				id: "hidden",
				label: "Hidden",
				href: "/hidden",
				visible: false,
			},
			{ type: "link", id: "about", label: "About", href: "/about" },
		];
		const { result } = renderHook(() => useNavItems(itemsWithHidden));
		expect(result.current.flatItems.map((i) => i.id)).toEqual([
			"home",
			"about",
		]);
	});

	it("excludes group when all children are invisible", () => {
		const itemsWithHiddenGroup: NavItemType[] = [
			{ type: "link", id: "home", label: "Home", href: "/" },
			{
				type: "group",
				id: "empty",
				label: "Empty",
				defaultOpened: true,
				children: [
					{ type: "link", id: "a", label: "A", href: "/a", visible: false },
				],
			},
		];
		const { result } = renderHook(() => useNavItems(itemsWithHiddenGroup));
		expect(result.current.flatItems.map((i) => i.id)).toEqual(["home"]);
	});
});
