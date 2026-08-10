import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
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

const links: NavItemType[] = [
	{ type: "link", id: "home", label: "Home", href: "/" },
	{ type: "link", id: "docs", label: "Docs", href: "/docs" },
];

function group(
	id: string,
	label: string,
	children: NavItemType[],
	defaultOpened?: boolean,
): NavItemType {
	return { type: "group", id, label, children, defaultOpened };
}

describe("NavGroup active resolution", () => {
	it("matches the active item by id", () => {
		// Arrange, Act
		render(<NavGroup items={links} activeItem="docs" />, { wrapper: Wrapper });

		// Assert
		expect(treeItem("docs")).toHaveAttribute("aria-current", "page");
		expect(treeItem("home")).not.toHaveAttribute("aria-current");
	});

	it("matches the active item by href", () => {
		// Arrange, Act
		render(<NavGroup items={links} activeItem="/docs" />, { wrapper: Wrapper });

		// Assert
		expect(treeItem("docs")).toHaveAttribute("aria-current", "page");
	});

	it("marks a group active when the active item is its id", () => {
		// Arrange, Act
		render(<NavGroup items={[group("g", "Group", links)]} activeItem="g" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(treeItem("g")).toHaveAttribute("data-active", "true");
	});

	it("falls back to route matching without an active item", () => {
		// Arrange, Act
		render(<NavGroup items={links} currentPath="/docs" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(treeItem("docs")).toHaveAttribute("aria-current", "page");
	});

	it("lets the active item override the current path", () => {
		// Arrange, Act
		render(<NavGroup items={links} currentPath="/docs" activeItem="home" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(treeItem("home")).toHaveAttribute("aria-current", "page");
		expect(treeItem("docs")).not.toHaveAttribute("aria-current");
	});

	it("reports the resolved active link once", () => {
		// Arrange
		const onActiveChange = vi.fn();

		// Act
		const { rerender } = render(
			<NavGroup
				items={links}
				activeItem="docs"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);
		rerender(
			<NavGroup
				items={links}
				activeItem="docs"
				onActiveChange={onActiveChange}
			/>,
		);

		// Assert
		expect(onActiveChange).toHaveBeenCalledTimes(1);
		expect(onActiveChange.mock.calls[0]?.[0]).toMatchObject({ id: "docs" });
	});

	it("stays silent when the active item matches nothing", () => {
		// Arrange
		const onActiveChange = vi.fn();

		// Act
		render(
			<NavGroup
				items={links}
				activeItem="missing"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(onActiveChange).not.toHaveBeenCalled();
	});

	it("reports null once an active item stops matching", () => {
		// Arrange
		const onActiveChange = vi.fn();
		const { rerender } = render(
			<NavGroup
				items={links}
				activeItem="docs"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		rerender(
			<NavGroup
				items={links}
				activeItem="missing"
				onActiveChange={onActiveChange}
			/>,
		);

		// Assert
		expect(onActiveChange).toHaveBeenLastCalledWith(null);
	});
});

describe("NavGroup route matching", () => {
	it("marks active item via currentPath", () => {
		render(<NavGroup items={flatItems} currentPath="/about" />, {
			wrapper: Wrapper,
		});
		const aboutLink = screen.getByText("About").closest("a");
		expect(aboutLink).toHaveAttribute("data-active", "true");
	});
});

describe("onActiveChange", () => {
	it("fires with the active link on mount when currentPath matches", () => {
		// Arrange
		const onActiveChange = vi.fn();

		// Act
		render(
			<NavGroup
				items={flatItems}
				currentPath="/about"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(onActiveChange).toHaveBeenCalledTimes(1);
		expect(onActiveChange.mock.calls[0]![0]).toMatchObject({
			id: "about",
			href: "/about",
		});
	});

	it("fires with the new link when currentPath changes", () => {
		// Arrange
		const onActiveChange = vi.fn();
		const { rerender } = render(
			<NavGroup
				items={flatItems}
				currentPath="/about"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);
		onActiveChange.mockClear();

		// Act
		rerender(
			<NavGroup
				items={flatItems}
				currentPath="/settings"
				onActiveChange={onActiveChange}
			/>,
		);

		// Assert
		expect(onActiveChange).toHaveBeenCalledTimes(1);
		expect(onActiveChange.mock.calls[0]![0]).toMatchObject({
			id: "settings",
		});
	});

	it("fires null when no item matches the new path", () => {
		// Arrange
		const onActiveChange = vi.fn();
		const { rerender } = render(
			<NavGroup
				items={flatItems}
				currentPath="/about"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);
		onActiveChange.mockClear();

		// Act
		rerender(
			<NavGroup
				items={flatItems}
				currentPath="/nowhere"
				onActiveChange={onActiveChange}
			/>,
		);

		// Assert
		expect(onActiveChange).toHaveBeenCalledTimes(1);
		expect(onActiveChange).toHaveBeenCalledWith(null);
	});

	it("does not refire on re-render with an unchanged active item", () => {
		// Arrange
		const onActiveChange = vi.fn();
		const { rerender } = render(
			<NavGroup
				items={flatItems}
				currentPath="/about"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);
		onActiveChange.mockClear();

		// Act
		rerender(
			<NavGroup
				items={flatItems}
				currentPath="/about"
				onActiveChange={onActiveChange}
			/>,
		);

		// Assert
		expect(onActiveChange).not.toHaveBeenCalled();
	});

	it("resolves the active link from the activeItem prop", () => {
		// Arrange
		const onActiveChange = vi.fn();

		// Act
		render(
			<NavGroup
				items={flatItems}
				activeItem="settings"
				onActiveChange={onActiveChange}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(onActiveChange).toHaveBeenCalledTimes(1);
		expect(onActiveChange).toHaveBeenCalledWith(
			expect.objectContaining({ id: "settings", href: "/settings" }),
		);
	});
});

describe("activeMatcher variants", () => {
	const items: NavItemType[] = [
		{ id: "home", type: "link", label: "Home", href: "/" },
		{
			id: "settings",
			type: "link",
			label: "Settings",
			href: "/settings",
		},
	];

	it("exact matcher only highlights exact path matches", () => {
		// Arrange / Act
		render(
			<NavGroup items={items} currentPath="/settings" activeMatcher="exact" />,
			{ wrapper: Wrapper },
		);

		// Assert
		const settingsEl = screen.getByText("Settings").closest("a");
		expect(settingsEl).toHaveAttribute("aria-current", "page");
		const homeEl = screen.getByText("Home").closest("a");
		expect(homeEl).not.toHaveAttribute("aria-current");
	});

	it("prefix matcher highlights parent paths", () => {
		// Arrange / Act
		render(
			<NavGroup
				items={items}
				currentPath="/settings/team"
				activeMatcher="prefix"
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		const settingsEl = screen.getByText("Settings").closest("a");
		expect(settingsEl).toHaveAttribute("aria-current", "page");
	});

	it("custom function matcher is applied", () => {
		// Arrange
		const customMatcher = (current: string, href: string) => current === href;

		// Act
		render(
			<NavGroup
				items={items}
				currentPath="/settings"
				activeMatcher={customMatcher}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		const settingsEl = screen.getByText("Settings").closest("a");
		expect(settingsEl).toHaveAttribute("aria-current", "page");
		const homeEl = screen.getByText("Home").closest("a");
		expect(homeEl).not.toHaveAttribute("aria-current");
	});
});
