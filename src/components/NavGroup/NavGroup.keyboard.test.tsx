import { MantineProvider } from "@mantine/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
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

const flatItems: NavItemType[] = [
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

describe("roving tabindex", () => {
	it("makes only the first treeitem tabbable initially", () => {
		// Arrange

		// Act
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });

		// Assert
		const tree = screen.getByRole("tree");
		expect(tree).toHaveAttribute("tabindex", "-1");
		expect(tree.querySelector('[data-item-id="home"]')).toHaveAttribute(
			"tabindex",
			"0",
		);
		expect(tree.querySelector('[data-item-id="about"]')).toHaveAttribute(
			"tabindex",
			"-1",
		);
		expect(tree.querySelector('[data-item-id="settings"]')).toHaveAttribute(
			"tabindex",
			"-1",
		);
	});

	it("makes the active item the tabbable stop", () => {
		// Arrange

		// Act
		render(<NavGroup items={flatItems} currentPath="/about" />, {
			wrapper: Wrapper,
		});

		// Assert
		const tree = screen.getByRole("tree");
		expect(tree.querySelector('[data-item-id="about"]')).toHaveAttribute(
			"tabindex",
			"0",
		);
		expect(tree.querySelector('[data-item-id="home"]')).toHaveAttribute(
			"tabindex",
			"-1",
		);
	});

	it("moves the tabbable stop as focus moves", () => {
		// Arrange
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Assert
		expect(tree.querySelector('[data-item-id="about"]')).toHaveAttribute(
			"tabindex",
			"0",
		);
		expect(tree.querySelector('[data-item-id="home"]')).toHaveAttribute(
			"tabindex",
			"-1",
		);
		expect(document.activeElement?.getAttribute("data-item-id")).toBe("about");
	});

	it("focuses the first item on ArrowDown when nothing in the tree has focus", () => {
		// Arrange
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		const tree = screen.getByRole("tree");

		// Act
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Assert
		expect(document.activeElement?.getAttribute("data-item-id")).toBe("home");
	});

	it("skips children of collapsed groups during arrow navigation", () => {
		// Arrange
		const items: NavItemType[] = [
			{ id: "home", type: "link", label: "Home", href: "/" },
			{
				id: "products",
				type: "group",
				label: "Products",
				defaultOpened: false,
				children: [
					{
						id: "catalog",
						type: "link",
						label: "Catalog",
						href: "/products",
					},
				],
			},
			{ id: "after", type: "link", label: "After", href: "/after" },
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Assert
		expect(document.activeElement?.getAttribute("data-item-id")).toBe("after");
	});

	it("marks the active link with aria-selected", () => {
		// Arrange

		// Act
		render(<NavGroup items={flatItems} currentPath="/about" />, {
			wrapper: Wrapper,
		});

		// Assert
		const tree = screen.getByRole("tree");
		expect(tree.querySelector('[data-item-id="about"]')).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(tree.querySelector('[data-item-id="home"]')).toHaveAttribute(
			"aria-selected",
			"false",
		);
	});
});

describe("keyboard tree navigation", () => {
	const kbItems: NavItemType[] = [
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
		{ id: "settings", type: "link", label: "Settings", href: "/settings" },
		{ id: "support", type: "link", label: "Support", href: "/support" },
	];

	const focusedId = () => document.activeElement?.getAttribute("data-item-id");

	function renderTree(
		props: Partial<React.ComponentProps<typeof NavGroup>> = {},
	) {
		render(<NavGroup items={kbItems} {...props} />, { wrapper: Wrapper });
		return screen.getByRole("tree");
	}

	it("ArrowRight expands a collapsed group without moving focus", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Grp",
				children: [{ id: "child", type: "link", label: "Child", href: "/c" }],
			},
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });
		expect(tree.querySelector('[data-item-id="grp"]')).toHaveAttribute(
			"aria-expanded",
			"false",
		);

		// Act
		fireEvent.keyDown(tree, { key: "ArrowRight" });

		// Assert
		expect(tree.querySelector('[data-item-id="grp"]')).toHaveAttribute(
			"aria-expanded",
			"true",
		);
		expect(focusedId()).toBe("grp");
	});

	it("ArrowRight on an expanded group moves focus to its first child", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.keyDown(tree, { key: "ArrowDown" });
		expect(focusedId()).toBe("products");

		// Act
		fireEvent.keyDown(tree, { key: "ArrowRight" });

		// Assert
		expect(focusedId()).toBe("catalog");
	});

	it("ArrowLeft collapses an expanded group", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowLeft" });

		// Assert
		expect(tree.querySelector('[data-item-id="products"]')).toHaveAttribute(
			"aria-expanded",
			"false",
		);
		expect(focusedId()).toBe("products");
	});

	it("ArrowLeft on a child moves focus to its parent group", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.keyDown(tree, { key: "ArrowDown" });
		fireEvent.keyDown(tree, { key: "ArrowRight" });
		expect(focusedId()).toBe("catalog");

		// Act
		fireEvent.keyDown(tree, { key: "ArrowLeft" });

		// Assert
		expect(focusedId()).toBe("products");
	});

	it("End and Home jump to the last and first visible items", () => {
		// Arrange
		const tree = renderTree();

		// Act
		fireEvent.keyDown(tree, { key: "End" });

		// Assert
		expect(focusedId()).toBe("support");
		fireEvent.keyDown(tree, { key: "Home" });
		expect(focusedId()).toBe("home");
	});

	it("ArrowDown wraps from the last item to the first by default", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "End" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Assert
		expect(focusedId()).toBe("home");
	});

	it("ArrowDown stays on the last item when loopNavigation is off", () => {
		// Arrange
		const tree = renderTree({ loopNavigation: false });
		fireEvent.keyDown(tree, { key: "End" });

		// Act
		fireEvent.keyDown(tree, { key: "ArrowDown" });

		// Assert
		expect(focusedId()).toBe("support");
	});

	it("type-ahead accumulates a buffer to disambiguate matches", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "s" });
		fireEvent.keyDown(tree, { key: "u" });

		// Assert
		expect(focusedId()).toBe("support");
	});

	it("type-ahead buffer resets after the timeout", () => {
		// Arrange
		vi.useFakeTimers();
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });
		fireEvent.keyDown(tree, { key: "s" });
		expect(focusedId()).toBe("settings");
		act(() => {
			vi.advanceTimersByTime(600);
		});

		// Act
		fireEvent.keyDown(tree, { key: "c" });

		// Assert
		expect(focusedId()).toBe("catalog");
		vi.useRealTimers();
	});

	it("Escape moves focus to the tree container", () => {
		// Arrange
		const tree = renderTree();
		fireEvent.keyDown(tree, { key: "Home" });
		expect(focusedId()).toBe("home");

		// Act
		fireEvent.keyDown(tree, { key: "Escape" });

		// Assert
		expect(document.activeElement).toBe(tree);
	});
});

describe("keyboard activation", () => {
	it("fires item onClick and onItemClick when Enter is pressed on a focused link", () => {
		// Arrange
		let defaultPrevented: boolean | null = null;
		const itemOnClick = vi.fn((e: React.MouseEvent) => {
			defaultPrevented = e.defaultPrevented;
			e.preventDefault();
		});
		const onItemClick = vi.fn();
		const items: NavItemType[] = [
			{
				id: "home",
				type: "link",
				label: "Home",
				href: "/home",
				onClick: itemOnClick,
			},
		];
		render(<NavGroup items={items} onItemClick={onItemClick} />, {
			wrapper: Wrapper,
		});
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "Enter" });

		// Assert
		expect(itemOnClick).toHaveBeenCalledTimes(1);
		expect(defaultPrevented).toBe(false);
		expect(onItemClick).toHaveBeenCalledTimes(1);
		expect(onItemClick.mock.calls[0]![0]).toMatchObject({ id: "home" });
	});

	it("dispatches a real click on the link element when Enter is pressed", () => {
		// Arrange
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		const tree = screen.getByRole("tree");
		const clickSpy = vi.fn((e: MouseEvent) => e.preventDefault());
		tree.addEventListener("click", clickSpy);
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "Enter" });

		// Assert
		expect(clickSpy).toHaveBeenCalledTimes(1);
		const target = clickSpy.mock.calls[0]![0].target as HTMLElement;
		expect(target.closest("a")).toHaveAttribute("href", "/");
	});

	it("activates a link via Space", () => {
		// Arrange
		const itemOnClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
		const onItemClick = vi.fn();
		const items: NavItemType[] = [
			{
				id: "home",
				type: "link",
				label: "Home",
				href: "/home",
				onClick: itemOnClick,
			},
		];
		render(<NavGroup items={items} onItemClick={onItemClick} />, {
			wrapper: Wrapper,
		});
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: " " });

		// Assert
		expect(itemOnClick).toHaveBeenCalledTimes(1);
		expect(onItemClick).toHaveBeenCalledTimes(1);
		expect(onItemClick.mock.calls[0]![0]).toMatchObject({ id: "home" });
	});

	it("does not activate a disabled link via Enter", () => {
		// Arrange
		const itemOnClick = vi.fn();
		const onItemClick = vi.fn();
		const items: NavItemType[] = [
			{
				id: "off",
				type: "link",
				label: "Off",
				href: "/off",
				disabled: true,
				onClick: itemOnClick,
			},
		];
		render(<NavGroup items={items} onItemClick={onItemClick} />, {
			wrapper: Wrapper,
		});
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "Enter" });

		// Assert
		expect(itemOnClick).not.toHaveBeenCalled();
		expect(onItemClick).not.toHaveBeenCalled();
	});

	it("does not toggle a disabled group via Enter", () => {
		// Arrange
		const onGroupToggle = vi.fn();
		const items: NavItemType[] = [
			{
				id: "grp",
				type: "group",
				label: "Grp",
				disabled: true,
				children: [{ id: "child", type: "link", label: "Child", href: "/c" }],
			},
		];
		render(<NavGroup items={items} onGroupToggle={onGroupToggle} />, {
			wrapper: Wrapper,
		});
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "Enter" });

		// Assert
		expect(onGroupToggle).not.toHaveBeenCalled();
		expect(
			tree.querySelector('[data-item-id="grp"]')?.getAttribute("aria-expanded"),
		).toBe("false");
	});
});
