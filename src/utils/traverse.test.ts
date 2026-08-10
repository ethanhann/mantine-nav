import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { findInNavTree, flattenNavTree, walkNavTree } from "./traverse";

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

	it("aborts the entire walk when visit returns 'stop'", () => {
		// Arrange
		const visited: string[] = [];

		// Act
		const stopped = walkNavTree(tree, (item) => {
			visited.push(item.id);
			if (item.id === "general") return "stop";
		});

		// Assert
		expect(stopped).toBe(true);
		expect(visited).toEqual(["home", "settings", "general"]);
	});

	it("returns false when the walk completes without stopping", () => {
		// Arrange

		// Act
		const stopped = walkNavTree(tree, () => undefined);

		// Assert
		expect(stopped).toBe(false);
	});
});

describe("findInNavTree", () => {
	it("returns the first item matching the predicate", () => {
		// Arrange

		// Act
		const result = findInNavTree(tree, (item) => item.type === "link");

		// Assert
		expect(result).toEqual(tree[0]);
		expect(result?.id).toBe("home");
	});

	it("finds a deeply nested item", () => {
		// Arrange

		// Act
		const result = findInNavTree(tree, (item) => item.id === "danger");

		// Assert
		expect(result).not.toBeNull();
		expect(result?.id).toBe("danger");
	});

	it("returns null when no item matches", () => {
		// Arrange

		// Act
		const result = findInNavTree(tree, (item) => item.id === "nonexistent");

		// Assert
		expect(result).toBeNull();
	});

	it("stops walking after finding the first match", () => {
		// Arrange
		const visited: string[] = [];

		// Act
		findInNavTree(tree, (item) => {
			visited.push(item.id);
			return item.id === "general";
		});

		// Assert
		expect(visited).toEqual(["home", "settings", "general"]);
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
