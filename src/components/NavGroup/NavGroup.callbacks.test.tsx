import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
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

describe("NavGroup click callbacks", () => {
	it("fires onItemClick", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<NavGroup items={flatItems} onItemClick={onClick} />, {
			wrapper: Wrapper,
		});
		await user.click(screen.getByText("Home"));
		expect(onClick).toHaveBeenCalled();
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

describe("NavGroup action items", () => {
	const action: NavItemType[] = [
		{ type: "link", id: "signout", label: "Sign out", onClick: () => {} },
	];

	it("renders an action item with no destination", () => {
		// Arrange, Act
		render(<NavGroup items={action} />, { wrapper: Wrapper });

		// Assert
		const el = screen.getByRole("treeitem");
		expect(el).not.toHaveAttribute("href");
		expect(el).toHaveTextContent("Sign out");
	});

	it("keeps an action item reachable by the roving tabindex", () => {
		// Arrange, Act
		render(<NavGroup items={action} />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute("tabindex", "0");
	});

	it("runs the action and suppresses navigation on click", async () => {
		// Arrange
		const onClick = vi.fn((e: React.MouseEvent) => {
			expect(e.defaultPrevented).toBe(true);
		});
		render(
			<NavGroup
				items={[{ type: "link", id: "signout", label: "Sign out", onClick }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("runs the action when Enter is pressed", () => {
		// Arrange
		const onClick = vi.fn();
		render(
			<NavGroup
				items={[{ type: "link", id: "signout", label: "Sign out", onClick }]}
			/>,
			{ wrapper: Wrapper },
		);
		const tree = screen.getByRole("tree");
		fireEvent.keyDown(tree, { key: "Home" });

		// Act
		fireEvent.keyDown(tree, { key: "Enter" });

		// Assert
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("reports the action through onItemClick with no href", async () => {
		// Arrange
		const onItemClick = vi.fn();
		render(<NavGroup items={action} onItemClick={onItemClick} />, {
			wrapper: Wrapper,
		});

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onItemClick.mock.calls[0]?.[0]).toMatchObject({ id: "signout" });
		expect(onItemClick.mock.calls[0]?.[0].href).toBeUndefined();
	});

	it("never marks an action item active from the route", () => {
		// Arrange, Act
		render(<NavGroup items={action} currentPath="/" />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByRole("treeitem")).not.toHaveAttribute("aria-current");
	});
});
