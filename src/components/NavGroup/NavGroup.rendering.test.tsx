import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const nestedItems: NavItemType[] = [
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

describe("NavGroup loading state", () => {
	it("renders five skeleton rows by default", () => {
		// Arrange, Act
		render(<NavGroup items={links} loading />, { wrapper: Wrapper });

		// Assert
		expect(document.querySelectorAll("[data-skeleton-row]")).toHaveLength(5);
	});

	it("honors an explicit skeleton count", () => {
		// Arrange, Act
		render(<NavGroup items={links} loading skeletonCount={3} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(document.querySelectorAll("[data-skeleton-row]")).toHaveLength(3);
	});

	it("varies the placeholder bar widths", () => {
		// Arrange, Act
		render(<NavGroup items={links} loading skeletonCount={3} />, {
			wrapper: Wrapper,
		});

		// Assert
		const bars = Array.from(
			document.querySelectorAll("[data-skeleton-row] > *:nth-child(2)"),
		).map((b) => (b as HTMLElement).style.getPropertyValue("--skeleton-width"));
		expect(bars).toEqual(["60%", "75%", "45%"]);
	});

	it("renders no tree while loading", () => {
		// Arrange, Act
		render(<NavGroup items={links} loading />, { wrapper: Wrapper });

		// Assert
		expect(screen.queryByRole("tree")).not.toBeInTheDocument();
	});
});

describe("NavGroup tree container", () => {
	it("names the tree Navigation by default", () => {
		// Arrange, Act
		render(<NavGroup items={links} />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByRole("tree")).toHaveAttribute(
			"aria-label",
			"Navigation",
		);
	});

	it("honors a custom tree label", () => {
		// Arrange, Act
		render(<NavGroup items={links} aria-label="Main nav" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByRole("tree")).toHaveAttribute("aria-label", "Main nav");
	});

	it("makes the tree focusable only with keyboard navigation enabled", () => {
		// Arrange, Act
		render(<NavGroup items={links} enableKeyboardNav={false} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByRole("tree")).not.toHaveAttribute("tabindex");
	});

	it("hides items marked invisible", () => {
		// Arrange, Act
		render(
			<NavGroup
				items={[{ ...links[0]!, visible: false } as NavItemType, links[1]!]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(treeItem("home")).toBeNull();
		expect(treeItem("docs")).not.toBeNull();
	});

	it("orders items by weight", () => {
		// Arrange, Act
		render(
			<NavGroup
				items={[
					{ ...links[0]!, weight: 2 } as NavItemType,
					{ ...links[1]!, weight: 1 } as NavItemType,
				]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		const ids = Array.from(document.querySelectorAll("[data-item-id]")).map(
			(el) => el.getAttribute("data-item-id"),
		);
		expect(ids).toEqual(["docs", "home"]);
	});

	it("reports item clicks", async () => {
		// Arrange
		const onItemClick = vi.fn();
		render(<NavGroup items={links} onItemClick={onItemClick} />, {
			wrapper: Wrapper,
		});

		// Act
		await userEvent.setup().click(treeItem("home"));

		// Assert
		expect(onItemClick).toHaveBeenCalledTimes(1);
	});

	it("stops rendering past maxDepth", () => {
		// Arrange, Act
		render(
			<NavGroup
				items={[group("a", "A", [group("a1", "A1", links, true)], true)]}
				maxDepth={1}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(treeItem("a")).not.toBeNull();
		expect(treeItem("a1")).toBeNull();
	});
});

describe("NavGroup item rendering", () => {
	it("renders flat list of items", () => {
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it("renders nested items", () => {
		render(<NavGroup items={nestedItems} />, { wrapper: Wrapper });
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Products")).toBeInTheDocument();
		expect(screen.getByText("Catalog")).toBeInTheDocument();
		expect(screen.getByText("Inventory")).toBeInTheDocument();
	});

	it("renders dividers", () => {
		const items: NavItemType[] = [
			{ id: "a", type: "link", label: "A", href: "/a" },
			{ id: "div", type: "divider" },
			{ id: "b", type: "link", label: "B", href: "/b" },
		];
		const { container } = render(<NavGroup items={items} />, {
			wrapper: Wrapper,
		});
		expect(
			container.querySelector(".mantine-Divider-root"),
		).toBeInTheDocument();
	});

	it("renders a divider label", () => {
		// Arrange
		const items: NavItemType[] = [
			{ id: "a", type: "link", label: "A", href: "/a" },
			{ id: "div", type: "divider", label: "Archive" },
		];

		// Act
		render(<NavGroup items={items} />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByText("Archive")).toBeInTheDocument();
	});

	it("applies a per-item aria-label to links", () => {
		// Arrange
		const items: NavItemType[] = [
			{
				id: "a",
				type: "link",
				label: "A",
				href: "/a",
				"aria-label": "Go to section A",
			},
		];

		// Act
		render(<NavGroup items={items} />, { wrapper: Wrapper });

		// Assert
		expect(
			screen.getByRole("treeitem", { name: "Go to section A" }),
		).toBeInTheDocument();
	});

	it("renders section headers", () => {
		const items: NavItemType[] = [
			{ id: "sec", type: "section", label: "Main" },
			{ id: "a", type: "link", label: "A", href: "/a" },
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.getByText("Main")).toBeInTheDocument();
	});

	it("has tree ARIA role", () => {
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		expect(screen.getByRole("tree")).toBeInTheDocument();
	});

	it("applies classNames and styles to tree slots", () => {
		// Arrange
		const items: NavItemType[] = [
			{ id: "a", type: "link", label: "A", href: "/a" },
			{ id: "sec", type: "section", label: "Main" },
			{ id: "div", type: "divider" },
		];

		// Act
		const { container } = render(
			<NavGroup
				items={items}
				classNames={{
					root: "custom-root",
					item: "custom-item",
					section: "custom-section",
					divider: "custom-divider",
				}}
				styles={{ item: { color: "rgb(9, 9, 9)" } }}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(container.querySelector(".custom-root")).toHaveAttribute(
			"role",
			"tree",
		);
		const item = container.querySelector(".custom-item");
		expect(item).not.toBeNull();
		expect(item).toHaveStyle({ color: "rgb(9, 9, 9)" });
		expect(container.querySelector(".custom-section")).not.toBeNull();
		expect(container.querySelector(".custom-divider")).not.toBeNull();
	});

	it("applies a custom aria-label to the tree", () => {
		// Arrange

		// Act
		render(<NavGroup items={flatItems} aria-label="Hauptnavigation" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(
			screen.getByRole("tree", { name: "Hauptnavigation" }),
		).toBeInTheDocument();
	});
});

describe("visibility", () => {
	it("hides item with visible: false", () => {
		const items: NavItemType[] = [
			{ id: "a", type: "link", label: "Visible", href: "/a" },
			{ id: "b", type: "link", label: "Hidden", href: "/b", visible: false },
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.getByText("Visible")).toBeInTheDocument();
		expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
	});

	it("hides item with visible callback returning false", () => {
		const items: NavItemType[] = [
			{ id: "a", type: "link", label: "Visible", href: "/a" },
			{
				id: "b",
				type: "link",
				label: "Hidden",
				href: "/b",
				visible: () => false,
			},
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.getByText("Visible")).toBeInTheDocument();
		expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
	});

	it("renders items without visible property normally", () => {
		render(<NavGroup items={flatItems} />, { wrapper: Wrapper });
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("About")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
	});

	it("hides group with visible: false and its children", () => {
		const items: NavItemType[] = [
			{ id: "home", type: "link", label: "Home", href: "/" },
			{
				id: "group",
				type: "group",
				label: "Admin",
				visible: false,
				children: [
					{ id: "users", type: "link", label: "Users", href: "/users" },
				],
			},
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
		expect(screen.queryByText("Users")).not.toBeInTheDocument();
	});

	it("auto-hides group when all children are invisible", () => {
		const items: NavItemType[] = [
			{
				id: "group",
				type: "group",
				label: "Empty Group",
				defaultOpened: true,
				children: [
					{ id: "a", type: "link", label: "A", href: "/a", visible: false },
					{ id: "b", type: "link", label: "B", href: "/b", visible: false },
				],
			},
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.queryByText("Empty Group")).not.toBeInTheDocument();
	});

	it("keeps group when at least one child is visible", () => {
		const items: NavItemType[] = [
			{
				id: "group",
				type: "group",
				label: "Partial",
				defaultOpened: true,
				children: [
					{
						id: "a",
						type: "link",
						label: "Hidden Child",
						href: "/a",
						visible: false,
					},
					{ id: "b", type: "link", label: "Visible Child", href: "/b" },
				],
			},
		];
		render(<NavGroup items={items} />, { wrapper: Wrapper });
		expect(screen.getByText("Partial")).toBeInTheDocument();
		expect(screen.queryByText("Hidden Child")).not.toBeInTheDocument();
		expect(screen.getByText("Visible Child")).toBeInTheDocument();
	});
});

describe("renderItem", () => {
	it("wraps custom items with tree-navigation attributes and routes clicks", async () => {
		const user = userEvent.setup();
		const onItemClick = vi.fn();
		const items: NavItemType[] = [
			{ id: "custom", type: "link", label: "Custom", href: "/custom" },
		];
		render(
			<NavGroup
				items={items}
				currentPath="/custom"
				onItemClick={onItemClick}
				renderItem={(item) => <span>{`R:${item.id}`}</span>}
			/>,
			{ wrapper: Wrapper },
		);
		const wrapper = screen
			.getByText("R:custom")
			.closest('[data-item-id="custom"]');
		expect(wrapper).not.toBeNull();
		expect(wrapper).toHaveAttribute("role", "treeitem");
		expect(wrapper).toHaveAttribute("aria-current", "page");

		await user.click(screen.getByText("R:custom"));
		expect(onItemClick).toHaveBeenCalled();
	});

	it("renders non-interactive custom items with presentation role", () => {
		const items: NavItemType[] = [{ id: "d", type: "divider" }];
		render(
			<NavGroup items={items} renderItem={() => <span>custom-divider</span>} />,
			{ wrapper: Wrapper },
		);
		const el = screen.getByText("custom-divider").closest("[role]");
		expect(el).toHaveAttribute("role", "presentation");
	});
});

describe("loading skeleton", () => {
	it("renders skeleton rows when loading is true", () => {
		// Arrange / Act
		render(<NavGroup items={[]} loading />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByTestId("nav-group-loading")).toBeInTheDocument();
		expect(screen.queryByRole("tree")).not.toBeInTheDocument();
	});

	it("renders the specified number of skeleton rows", () => {
		// Arrange / Act
		render(<NavGroup items={[]} loading skeletonCount={3} />, {
			wrapper: Wrapper,
		});

		// Assert
		const container = screen.getByTestId("nav-group-loading");
		const rows = container.querySelectorAll("[data-skeleton-row]");
		expect(rows).toHaveLength(3);
	});

	it("defaults to 5 skeleton rows", () => {
		// Arrange / Act
		render(<NavGroup items={[]} loading />, { wrapper: Wrapper });

		// Assert
		const container = screen.getByTestId("nav-group-loading");
		const rows = container.querySelectorAll("[data-skeleton-row]");
		expect(rows).toHaveLength(5);
	});

	it("renders the tree when loading is false", () => {
		// Arrange / Act
		render(<NavGroup items={flatItems} loading={false} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.queryByTestId("nav-group-loading")).not.toBeInTheDocument();
		expect(screen.getByRole("tree")).toBeInTheDocument();
	});

	it("applies root classNames and styles to the skeleton container", () => {
		// Arrange / Act
		const { container } = render(
			<NavGroup
				items={[]}
				loading
				classNames={{ root: "custom-root" }}
				styles={{ root: { padding: 8 } }}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		const el = container.querySelector(".custom-root");
		expect(el).not.toBeNull();
		expect(el).toHaveStyle({ padding: "8px" });
	});
});
