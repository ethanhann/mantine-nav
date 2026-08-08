import {
	DirectionProvider,
	MantineProvider,
	useDirection,
} from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavShell } from "../NavShell";
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

describe("collapsed rail mode", () => {
	const railItems: NavItemType[] = [
		{
			id: "products",
			type: "group",
			label: "Products",
			children: [
				{ id: "catalog", type: "link", label: "Catalog", href: "/products" },
				{ id: "admin-section", type: "section", label: "Admin" },
				{ id: "div-1", type: "divider" },
				{
					id: "sub",
					type: "group",
					label: "Sub Tools",
					children: [
						{
							id: "inner",
							type: "link",
							label: "Inner Tool",
							href: "/inner",
						},
					],
				},
			],
		},
	];

	it("renders sections, dividers, and nested group children in the rail menu", async () => {
		// Arrange
		const user = userEvent.setup();
		render(
			<NavShell
				defaultDesktopCollapsed
				sidebar={<NavGroup items={railItems} />}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Act
		await user.click(
			screen.getByRole("treeitem", { name: "Products", hidden: true }),
		);

		// Assert
		expect(await screen.findByText("Catalog")).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Sub Tools")).toBeInTheDocument();
		expect(screen.getByText("Inner Tool")).toBeInTheDocument();
	});

	it("does not preventDefault for rail menu links with an href", async () => {
		// Arrange
		const user = userEvent.setup();
		let defaultPrevented: boolean | null = null;
		const itemOnClick = vi.fn((e: React.MouseEvent) => {
			defaultPrevented = e.defaultPrevented;
			e.preventDefault();
		});
		const onItemClick = vi.fn();
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Grp",
				children: [
					{
						id: "child",
						type: "link",
						label: "Child",
						href: "/child",
						onClick: itemOnClick,
					},
				],
			},
		];
		render(
			<NavShell
				defaultDesktopCollapsed
				sidebar={<NavGroup items={items} onItemClick={onItemClick} />}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		await user.click(
			screen.getByRole("treeitem", { name: "Grp", hidden: true }),
		);

		// Act
		await user.click(await screen.findByText("Child"));

		// Assert
		expect(itemOnClick).toHaveBeenCalledTimes(1);
		expect(defaultPrevented).toBe(false);
		expect(onItemClick).toHaveBeenCalledTimes(1);
	});
});

describe("RTL support", () => {
	function RTLWrapper({ children }: { children: React.ReactNode }) {
		return (
			<MantineProvider>
				<DirectionProvider initialDirection="rtl" detectDirection={false}>
					{children}
				</DirectionProvider>
			</MantineProvider>
		);
	}

	it("ArrowLeft expands a collapsed group in RTL", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Group",
				children: [
					{ id: "child", type: "link", label: "Child", href: "/child" },
				],
			},
		];
		render(<NavGroup items={items} />, { wrapper: RTLWrapper });
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowLeft" });

		// Assert
		expect(
			tree.querySelector('[data-item-id="grp"]')?.getAttribute("aria-expanded"),
		).toBe("true");
	});

	it("ArrowRight collapses an expanded group in RTL", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Group",
				defaultOpened: true,
				children: [
					{ id: "child", type: "link", label: "Child", href: "/child" },
				],
			},
		];
		render(<NavGroup items={items} />, { wrapper: RTLWrapper });
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowRight" });

		// Assert
		expect(
			tree.querySelector('[data-item-id="grp"]')?.getAttribute("aria-expanded"),
		).toBe("false");
	});

	it("adopts the new arrow-key mapping after direction changes at runtime", () => {
		// Arrange
		function ToggleDirection() {
			const { toggleDirection } = useDirection();
			return (
				<button type="button" onClick={toggleDirection}>
					toggle-dir
				</button>
			);
		}
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Group",
				children: [
					{ id: "child", type: "link", label: "Child", href: "/child" },
				],
			},
		];
		render(
			<MantineProvider>
				<DirectionProvider initialDirection="ltr" detectDirection={false}>
					<ToggleDirection />
					<NavGroup items={items} />
				</DirectionProvider>
			</MantineProvider>,
		);
		const tree = screen.getByRole("tree");
		const group = tree.querySelector('[data-item-id="grp"]');
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.click(screen.getByText("toggle-dir"));

		// Act
		fireEvent.keyDown(tree, { key: "ArrowLeft" });

		// Assert
		expect(group?.getAttribute("aria-expanded")).toBe("true");
	});
});
