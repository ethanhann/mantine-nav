import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../../types";
import { NavGroup } from "./NavGroup";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

function treeItem(id: string) {
	return document.querySelector(`[data-item-id="${id}"]`) as HTMLElement;
}

function _expanded(id: string) {
	return treeItem(id)?.getAttribute("aria-expanded");
}

const _flatItems: NavItemType[] = [
	{ id: "home", type: "link", label: "Home", href: "/" },
	{ id: "about", type: "link", label: "About", href: "/about" },
	{ id: "settings", type: "link", label: "Settings", href: "/settings" },
];

const _nestedItems: NavItemType[] = [
	{ id: "home", type: "link", label: "Home", href: "/" },
	{
		id: "products",
		type: "group",
		label: "Products",
		defaultOpened: true,
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
];

const _links: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{ type: "link", id: "docs", label: "Docs", href: "/docs" },
];

function _group(
	id: string,
	label: string,
	children: NavItemType[],
	defaultOpened?: boolean,
): NavItemType {
	return { type: "group", id, label, children, defaultOpened };
}

describe("maxDepth", () => {
	it("does not render groups beyond maxDepth", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "l1",
				type: "group",
				label: "Level 1",
				defaultOpened: true,
				children: [
					{
						id: "l2",
						type: "group",
						label: "Level 2",
						defaultOpened: true,
						children: [
							{
								id: "l3",
								type: "group",
								label: "Level 3",
								children: [
									{
										id: "deep",
										type: "link",
										label: "Deep Link",
										href: "/deep",
									},
								],
							},
						],
					},
				],
			},
		];

		// Act
		render(<NavGroup items={items} maxDepth={2} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("Level 1")).toBeInTheDocument();
		expect(screen.getByText("Level 2")).toBeInTheDocument();
		expect(screen.queryByText("Level 3")).not.toBeInTheDocument();
		expect(screen.queryByText("Deep Link")).not.toBeInTheDocument();
	});

	it("renders all levels when maxDepth is sufficient", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "l1",
				type: "group",
				label: "Level 1",
				defaultOpened: true,
				children: [
					{
						id: "l2",
						type: "group",
						label: "Level 2",
						defaultOpened: true,
						children: [
							{ id: "leaf", type: "link", label: "Leaf", href: "/leaf" },
						],
					},
				],
			},
		];

		// Act
		render(<NavGroup items={items} maxDepth={5} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("Level 1")).toBeInTheDocument();
		expect(screen.getByText("Level 2")).toBeInTheDocument();
		expect(screen.getByText("Leaf")).toBeInTheDocument();
	});
});
