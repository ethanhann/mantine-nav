import { DirectionProvider, MantineProvider } from "@mantine/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavShell } from "../NavShell";
import { NavGroup } from "./NavGroup";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
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

describe("NavGroup (Mantine NavLink)", () => {
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

	it("expands defaultOpened groups that appear after mount", () => {
		const initial: NavItemType[] = [
			{ id: "home", type: "link", label: "Home", href: "/" },
		];
		const { rerender } = render(<NavGroup items={initial} />, {
			wrapper: Wrapper,
		});
		expect(screen.queryByText("Async Child")).not.toBeInTheDocument();

		const withAsyncGroup: NavItemType[] = [
			...initial,
			{
				id: "async",
				type: "group",
				label: "Async",
				defaultOpened: true,
				children: [
					{
						id: "async-child",
						type: "link",
						label: "Async Child",
						href: "/async/child",
					},
				],
			},
		];
		rerender(<NavGroup items={withAsyncGroup} />);

		const group = screen.getByText("Async").closest("[aria-expanded]");
		expect(group).toHaveAttribute("aria-expanded", "true");
	});

	it("marks active item via currentPath", () => {
		render(<NavGroup items={flatItems} currentPath="/about" />, {
			wrapper: Wrapper,
		});
		const aboutLink = screen.getByText("About").closest("a");
		expect(aboutLink).toHaveAttribute("data-active", "true");
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

	it("fires onItemClick", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<NavGroup items={flatItems} onItemClick={onClick} />, {
			wrapper: Wrapper,
		});
		await user.click(screen.getByText("Home"));
		expect(onClick).toHaveBeenCalled();
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
				<NavGroup
					items={items}
					renderItem={() => <span>custom-divider</span>}
				/>,
				{ wrapper: Wrapper },
			);
			const el = screen.getByText("custom-divider").closest("[role]");
			expect(el).toHaveAttribute("role", "presentation");
		});
	});

	describe("external and onClick", () => {
		it("renders external link with target and rel attributes", () => {
			const items: NavItemType[] = [
				{
					id: "ext",
					type: "link",
					label: "External",
					href: "https://example.com",
					external: true,
				},
			];
			render(<NavGroup items={items} />, { wrapper: Wrapper });
			const link = screen.getByText("External").closest("a");
			expect(link).toHaveAttribute("target", "_blank");
			expect(link).toHaveAttribute("rel", "noopener noreferrer");
		});

		it("external link bypasses linkComponent from context", () => {
			const FakeLink = React.forwardRef<
				HTMLAnchorElement,
				React.AnchorHTMLAttributes<HTMLAnchorElement>
			>((props, ref) => <a ref={ref} data-router-link {...props} />);
			FakeLink.displayName = "FakeLink";

			const items: NavItemType[] = [
				{
					id: "ext",
					type: "link",
					label: "External",
					href: "https://example.com",
					external: true,
				},
			];
			render(
				<NavShell linkComponent={FakeLink} sidebar={<NavGroup items={items} />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			const link = screen.getByText("External").closest("a");
			expect(link).toHaveAttribute("target", "_blank");
			expect(link).not.toHaveAttribute("data-router-link");
		});

		it("passes hrefProp to linkComponent instead of href", () => {
			const FakeLink = React.forwardRef<
				HTMLAnchorElement,
				React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
			>((props, ref) => (
				<a ref={ref} data-router-link data-to={props.to} {...props} />
			));
			FakeLink.displayName = "FakeLink";
			const items = [
				{
					id: "home",
					type: "link" as const,
					label: "Home",
					href: "/home",
				},
			];
			render(
				<NavShell
					linkComponent={FakeLink}
					hrefProp="to"
					sidebar={<NavGroup items={items} />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			const link = screen.getByText("Home").closest("[data-router-link]");
			expect(link).toHaveAttribute("data-to", "/home");
		});

		it("fires item onClick handler", async () => {
			const user = userEvent.setup();
			const handleClick = vi.fn();
			const items: NavItemType[] = [
				{
					id: "action",
					type: "link",
					label: "Action",
					href: "#",
					onClick: handleClick,
				},
			];
			render(<NavGroup items={items} />, { wrapper: Wrapper });
			await user.click(screen.getByText("Action"));
			expect(handleClick).toHaveBeenCalled();
		});

		it("does not preventDefault for links with an href, letting consumer decide", async () => {
			const user = userEvent.setup();
			let prevented: boolean | undefined;
			const items: NavItemType[] = [
				{
					id: "link",
					type: "link",
					label: "Tracked",
					href: "/page",
					onClick: (e) => {
						prevented = e.defaultPrevented;
					},
				},
			];
			render(<NavGroup items={items} />, { wrapper: Wrapper });
			await user.click(screen.getByText("Tracked"));
			expect(prevented).toBe(false);
		});

		it("item onClick does not suppress onItemClick callback", async () => {
			const user = userEvent.setup();
			const itemOnClick = vi.fn();
			const groupOnItemClick = vi.fn();
			const items: NavItemType[] = [
				{
					id: "action",
					type: "link",
					label: "Action",
					href: "#",
					onClick: itemOnClick,
				},
			];
			render(<NavGroup items={items} onItemClick={groupOnItemClick} />, {
				wrapper: Wrapper,
			});
			await user.click(screen.getByText("Action"));
			expect(itemOnClick).toHaveBeenCalled();
			expect(groupOnItemClick).toHaveBeenCalled();
		});
	});

	describe("controlled expandedKeys", () => {
		it("drives group expansion from the prop and reports intended changes", async () => {
			// Arrange
			const user = userEvent.setup();
			const onExpandedChange = vi.fn();
			const { rerender } = render(
				<NavGroup
					items={nestedItems}
					expandedKeys={[]}
					onExpandedChange={onExpandedChange}
				/>,
				{ wrapper: Wrapper },
			);
			const getGroup = () =>
				screen.getByText("Products").closest('[role="treeitem"]');
			expect(getGroup()).toHaveAttribute("aria-expanded", "false");

			// Act
			await user.click(screen.getByText("Products"));

			// Assert
			expect(onExpandedChange).toHaveBeenCalledWith(["products"]);
			expect(getGroup()).toHaveAttribute("aria-expanded", "false");
			rerender(
				<NavGroup
					items={nestedItems}
					expandedKeys={["products"]}
					onExpandedChange={onExpandedChange}
				/>,
			);
			expect(getGroup()).toHaveAttribute("aria-expanded", "true");
		});
	});

	describe("accordion callbacks", () => {
		it("fires onAccordionChange exactly once per toggle under StrictMode", async () => {
			// Arrange
			const user = userEvent.setup();
			const onAccordionChange = vi.fn();
			render(
				<React.StrictMode>
					<NavGroup
						items={nestedItems}
						accordion
						onAccordionChange={onAccordionChange}
					/>
				</React.StrictMode>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByText("Products"));

			// Assert
			expect(onAccordionChange).toHaveBeenCalledTimes(1);
			expect(onAccordionChange).toHaveBeenCalledWith(null);
		});
	});

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
			expect(document.activeElement?.getAttribute("data-item-id")).toBe(
				"about",
			);
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
			expect(document.activeElement?.getAttribute("data-item-id")).toBe(
				"after",
			);
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

		const focusedId = () =>
			document.activeElement?.getAttribute("data-item-id");

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
				tree
					.querySelector('[data-item-id="grp"]')
					?.getAttribute("aria-expanded"),
			).toBe("false");
		});
	});

	describe("onNavigate telemetry", () => {
		it("fires onNavigate with source 'sidebar' and trigger 'mouse' on click", async () => {
			// Arrange
			const user = userEvent.setup();
			const onNavigate = vi.fn();
			const items: NavItemType[] = [
				{
					id: "home",
					type: "link",
					label: "Home",
					href: "/home",
					data: { key: "val" },
				},
			];
			render(
				<NavShell onNavigate={onNavigate} sidebar={<NavGroup items={items} />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByText("Home"));

			// Assert
			expect(onNavigate).toHaveBeenCalledTimes(1);
			expect(onNavigate).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "home",
					label: "Home",
					href: "/home",
					source: "sidebar",
					trigger: "mouse",
					data: { key: "val" },
				}),
			);
		});

		it("fires onNavigate with trigger 'keyboard' on Enter", () => {
			// Arrange
			const onNavigate = vi.fn();
			const items: NavItemType[] = [
				{ id: "home", type: "link", label: "Home", href: "/home" },
			];
			render(
				<NavShell onNavigate={onNavigate} sidebar={<NavGroup items={items} />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			const tree = screen.getByRole("tree");
			fireEvent.keyDown(tree, { key: "Home" });

			// Act
			fireEvent.keyDown(tree, { key: "Enter" });

			// Assert
			expect(onNavigate).toHaveBeenCalledTimes(1);
			expect(onNavigate).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "home",
					source: "sidebar",
					trigger: "keyboard",
				}),
			);
		});

		it("does not fire onNavigate for disabled items", () => {
			// Arrange
			const onNavigate = vi.fn();
			const items: NavItemType[] = [
				{
					id: "off",
					type: "link",
					label: "Off",
					href: "/off",
					disabled: true,
				},
			];
			render(
				<NavShell onNavigate={onNavigate} sidebar={<NavGroup items={items} />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			const tree = screen.getByRole("tree");
			fireEvent.keyDown(tree, { key: "Home" });

			// Act
			fireEvent.keyDown(tree, { key: "Enter" });

			// Assert
			expect(onNavigate).not.toHaveBeenCalled();
		});

		it("does not fire onNavigate for group toggles", async () => {
			// Arrange
			const user = userEvent.setup();
			const onNavigate = vi.fn();
			render(
				<NavShell
					onNavigate={onNavigate}
					sidebar={<NavGroup items={nestedItems} />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByText("Products"));

			// Assert
			expect(onNavigate).not.toHaveBeenCalled();
		});

		it("fires onItemClick alongside onNavigate", async () => {
			// Arrange
			const user = userEvent.setup();
			const onNavigate = vi.fn();
			const onItemClick = vi.fn();
			const items: NavItemType[] = [
				{ id: "home", type: "link", label: "Home", href: "/home" },
			];
			render(
				<NavShell
					onNavigate={onNavigate}
					sidebar={<NavGroup items={items} onItemClick={onItemClick} />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByText("Home"));

			// Assert
			expect(onItemClick).toHaveBeenCalledTimes(1);
			expect(onNavigate).toHaveBeenCalledTimes(1);
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
				tree
					.querySelector('[data-item-id="grp"]')
					?.getAttribute("aria-expanded"),
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
				tree
					.querySelector('[data-item-id="grp"]')
					?.getAttribute("aria-expanded"),
			).toBe("false");
		});
	});

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
				<NavGroup
					items={items}
					currentPath="/settings"
					activeMatcher="exact"
				/>,
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
			const customMatcher = (current: string, href: string) =>
				current === href;

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
});
