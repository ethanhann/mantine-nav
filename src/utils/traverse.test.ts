import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { flattenNavTree, walkNavTree } from "./traverse";

const tree: NavItemType[] = [
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
	{ id: "sec", type: "section", label: "Other" },
];

describe("walkNavTree", () => {
	it("visits every item depth-first with depths", () => {
		// Arrange
		const visited: Array<[string, number]> = [];

		// Act
		walkNavTree(tree, (item, depth) => {
			visited.push([item.id, depth]);
			return undefined;
		});

		// Assert
		expect(visited).toEqual([
			["home", 0],
			["settings", 0],
			["general", 1],
			["advanced", 1],
			["danger", 2],
			["sec", 0],
		]);
	});

	it("skips a group's children when visit returns false", () => {
		// Arrange
		const visited: string[] = [];

		// Act
		walkNavTree(tree, (item) => {
			visited.push(item.id);
			return item.id === "settings" ? false : undefined;
		});

		// Assert
		expect(visited).toEqual(["home", "settings", "sec"]);
	});
});

describe("flattenNavTree", () => {
	it("returns all items in depth-first order", () => {
		// Arrange

		// Act
		const flat = flattenNavTree(tree);

		// Assert
		expect(flat.map((i) => i.id)).toEqual([
			"home",
			"settings",
			"general",
			"advanced",
			"danger",
			"sec",
		]);
	});
});
