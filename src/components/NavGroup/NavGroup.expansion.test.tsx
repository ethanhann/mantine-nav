import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavGroup } from "./NavGroup";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

function treeItem(id: string) {
	return document.querySelector(`[data-item-id="${id}"]`) as HTMLElement;
}

function expanded(id: string) {
	return treeItem(id)?.getAttribute("aria-expanded");
}

const _flatItems: NavItemType[] = [
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

describe("NavGroup defaultOpened", () => {
	const nested = [
		group("a", "A", [group("a1", "A1", links, true)], true),
		group("b", "B", links, true),
	];

	it("expands every defaultOpened group without accordion", () => {
		// Arrange, Act
		render(<NavGroup items={nested} />, { wrapper: Wrapper });

		// Assert
		expect(expanded("a")).toBe("true");
		expect(expanded("a1")).toBe("true");
		expect(expanded("b")).toBe("true");
	});

	it("expands only the first defaultOpened group under a global accordion", () => {
		// Arrange, Act
		render(<NavGroup items={nested} accordion accordionScope="global" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(expanded("a")).toBe("true");
		expect(expanded("b")).toBe("false");
	});

	it("expands one defaultOpened group per level under a sibling accordion", () => {
		// Arrange, Act
		render(<NavGroup items={nested} accordion accordionScope="sibling" />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(expanded("a")).toBe("true");
		expect(expanded("a1")).toBe("true");
		expect(expanded("b")).toBe("false");
	});

	it("expands a defaultOpened group added after mount", async () => {
		// Arrange
		const { rerender } = render(<NavGroup items={[group("a", "A", links)]} />, {
			wrapper: Wrapper,
		});

		// Act
		rerender(
			<NavGroup
				items={[group("a", "A", links), group("c", "C", links, true)]}
			/>,
		);

		// Assert
		await waitFor(() => expect(expanded("c")).toBe("true"));
	});

	it("ignores defaultOpened when expansion is controlled", () => {
		// Arrange, Act
		render(<NavGroup items={nested} expandedKeys={[]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(expanded("a")).toBe("false");
		expect(expanded("b")).toBe("false");
	});
});

describe("NavGroup accordion toggling", () => {
	const two = [group("a", "A", links), group("b", "B", links)];

	it("closes the open group when another opens under a global accordion", async () => {
		// Arrange
		render(<NavGroup items={two} accordion accordionScope="global" />, {
			wrapper: Wrapper,
		});
		const user = userEvent.setup();
		await user.click(treeItem("a"));

		// Act
		await user.click(treeItem("b"));

		// Assert
		expect(expanded("a")).toBe("false");
		expect(expanded("b")).toBe("true");
	});

	it("leaves a different level alone under a sibling accordion", async () => {
		// Arrange
		const tree = [
			group("a", "A", [group("a1", "A1", links)]),
			group("b", "B", links),
		];
		render(<NavGroup items={tree} accordion accordionScope="sibling" />, {
			wrapper: Wrapper,
		});
		const user = userEvent.setup();
		await user.click(treeItem("a"));
		await user.click(treeItem("a1"));

		// Act
		await user.click(treeItem("b"));

		// Assert
		expect(expanded("a")).toBe("false");
		expect(expanded("a1")).toBe("true");
	});

	it("reports the opened key and null on close", async () => {
		// Arrange
		const onAccordionChange = vi.fn();
		render(
			<NavGroup items={two} accordion onAccordionChange={onAccordionChange} />,
			{ wrapper: Wrapper },
		);
		const user = userEvent.setup();

		// Act
		await user.click(treeItem("a"));
		await user.click(treeItem("a"));

		// Assert
		expect(onAccordionChange.mock.calls).toEqual([["a"], [null]]);
	});

	it("stays silent about accordion changes when accordion is off", async () => {
		// Arrange
		const onAccordionChange = vi.fn();
		render(<NavGroup items={two} onAccordionChange={onAccordionChange} />, {
			wrapper: Wrapper,
		});

		// Act
		await userEvent.setup().click(treeItem("a"));

		// Assert
		expect(onAccordionChange).not.toHaveBeenCalled();
	});

	it("keeps both groups open without an accordion", async () => {
		// Arrange
		render(<NavGroup items={two} />, { wrapper: Wrapper });
		const user = userEvent.setup();
		await user.click(treeItem("a"));

		// Act
		await user.click(treeItem("b"));

		// Assert
		expect(expanded("a")).toBe("true");
		expect(expanded("b")).toBe("true");
	});

	it("reports the full expanded set on every change", async () => {
		// Arrange
		const onExpandedChange = vi.fn();
		render(<NavGroup items={two} onExpandedChange={onExpandedChange} />, {
			wrapper: Wrapper,
		});

		// Act
		await userEvent.setup().click(treeItem("a"));

		// Assert
		expect(onExpandedChange).toHaveBeenCalledWith(["a"]);
	});
});

describe("NavGroup late defaults", () => {
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
