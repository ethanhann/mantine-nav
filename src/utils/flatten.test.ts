import { describe, expect, it } from "vitest";
import type { NavItemType } from "../types";
import { flattenNavCommands } from "./flatten";

const tree: NavItemType[] = [
	{ id: "home", type: "link", label: "Home", href: "/" },
	{
		id: "products",
		type: "group",
		label: "Products",
		href: "/products",
		children: [
			{ id: "catalog", type: "link", label: "Catalog", href: "/products" },
			{
				id: "inventory",
				type: "link",
				label: "Inventory",
				href: "/products/inventory",
			},
		],
	},
	{ id: "section", type: "section", label: "More" },
	{ id: "divider", type: "divider" },
	{
		id: "hidden",
		type: "link",
		label: "Hidden",
		href: "/hidden",
		visible: false,
	},
];

describe("flattenNavCommands", () => {
	it("flattens nested link items", () => {
		const commands = flattenNavCommands(tree);
		const ids = commands.map((c) => c.id);
		expect(ids).toContain("home");
		expect(ids).toContain("inventory");
	});

	it("emits a command for a group that has its own href", () => {
		const commands = flattenNavCommands(tree);
		const products = commands.find((c) => c.id === "products");
		expect(products).toBeDefined();
		expect(products?.href).toBe("/products");
	});

	it("carries the item's generic data through to the command", () => {
		const items: NavItemType<{ score: number }>[] = [
			{
				id: "a",
				type: "link",
				label: "A",
				href: "/a",
				data: { score: 42 },
			},
		];
		const commands = flattenNavCommands(items);
		expect(commands[0]?.data).toEqual({ score: 42 });
	});

	it("records the ancestor group path as a breadcrumb", () => {
		const commands = flattenNavCommands(tree);
		const inventory = commands.find((c) => c.id === "inventory");
		expect(inventory?.path).toEqual(["Products"]);
	});

	it("skips section and divider items", () => {
		const ids = flattenNavCommands(tree).map((c) => c.id);
		expect(ids).not.toContain("section");
		expect(ids).not.toContain("divider");
	});

	it("drops items that are not visible", () => {
		const ids = flattenNavCommands(tree).map((c) => c.id);
		expect(ids).not.toContain("hidden");
	});

	it("de-duplicates by id (first occurrence wins)", () => {
		const dupes: NavItemType[] = [
			{ id: "x", type: "link", label: "First", href: "/a" },
			{ id: "x", type: "link", label: "Second", href: "/b" },
		];
		const commands = flattenNavCommands(dupes);
		expect(commands).toHaveLength(1);
		expect(commands[0]!.label).toBe("First");
	});
});
