import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavItemRenderer } from "./NavItemRenderer";

function menuItems() {
	return Array.from(document.querySelectorAll(".mantine-Menu-item"));
}

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const RouterLink = (props: Record<string, unknown>) => (
	<a data-testid="router-link" {...props} />
);

type Props = React.ComponentProps<typeof NavItemRenderer>;

function setup(item: NavItemType, overrides: Partial<Props> = {}) {
	const props = {
		item,
		depth: 0,
		maxDepth: 3,
		expandedGroups: new Set<string>(),
		onToggleGroup: vi.fn(),
		isActive: () => false,
		variant: "light" as const,
		hrefProp: "href",
		rovingItemId: null,
		dir: "ltr" as const,
		...overrides,
	} as Props;
	const view = render(<NavItemRenderer {...props} />, { wrapper: Wrapper });
	return { ...view, props };
}

const link: NavItemType = {
	type: "link",
	id: "alpha",
	label: "Alpha",
	href: "/alpha",
};
const group: NavItemType = {
	type: "group",
	id: "grp",
	label: "Group",
	children: [{ type: "link", id: "child", label: "Child", href: "/child" }],
};

describe("NavItemRenderer collapsed rail links", () => {
	it("shows the label in a tooltip and as the accessible name", async () => {
		// Arrange
		setup(link, { collapsed: true });

		// Act
		await userEvent.setup().hover(screen.getByRole("treeitem"));

		// Assert
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Alpha");
		expect(screen.getByRole("treeitem")).toHaveAttribute("aria-label", "Alpha");
	});

	it("prefers an explicit aria-label over the visible label", () => {
		// Arrange, Act
		setup({ ...link, "aria-label": "Go to Alpha" }, { collapsed: true });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-label",
			"Go to Alpha",
		);
	});

	it("flips the tooltip to the other side in RTL", async () => {
		// Arrange
		setup(link, { collapsed: true, dir: "rtl" });

		// Act
		await userEvent.setup().hover(screen.getByRole("treeitem"));

		// Assert
		const tooltip = await screen.findByRole("tooltip");
		expect(Number.parseFloat(tooltip.style.left)).toBeLessThan(0);
	});

	it("keeps the tooltip on the trailing side in LTR", async () => {
		// Arrange
		setup(link, { collapsed: true });

		// Act
		await userEvent.setup().hover(screen.getByRole("treeitem"));

		// Assert
		const tooltip = await screen.findByRole("tooltip");
		expect(Number.parseFloat(tooltip.style.left)).toBeGreaterThan(0);
	});

	it("marks the active rail item with an indicator", () => {
		// Arrange, Act
		setup(link, { collapsed: true, isActive: () => true });

		// Assert
		expect(document.querySelectorAll("span[aria-hidden=true]")).toHaveLength(1);
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("omits the indicator for an inactive rail item", () => {
		// Arrange, Act
		setup(link, { collapsed: true });

		// Assert
		expect(document.querySelectorAll("span[aria-hidden=true]")).toHaveLength(0);
	});

	it("keeps external rail links plain anchors", () => {
		// Arrange, Act
		setup({ ...link, external: true }, { collapsed: true });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute("target", "_blank");
	});

	it("uses the router component for internal rail links", () => {
		// Arrange, Act
		setup(link, { collapsed: true, linkComponent: RouterLink });

		// Assert
		expect(screen.getByTestId("router-link")).toBeInTheDocument();
	});

	it("does not apply the rail treatment below the top level", () => {
		// Arrange, Act
		setup(link, { collapsed: true, depth: 1 });

		// Assert
		expect(screen.getByText("Alpha")).toBeInTheDocument();
	});
});

describe("NavItemRenderer collapsed rail groups", () => {
	async function openRail(overrides: Partial<Props> = {}) {
		setup(group, { collapsed: true, ...overrides });
		await userEvent.setup().click(screen.getByRole("treeitem"));
		return waitFor(() => {
			const dropdown = document.querySelector(".mantine-Menu-dropdown");
			expect(dropdown).not.toBeNull();
			return dropdown as HTMLElement;
		});
	}

	it("opens a flyout anchored to the trailing side in LTR", async () => {
		// Arrange, Act
		const menu = await openRail();

		// Assert
		expect(menu).toHaveAttribute("data-position", "right-start");
	});

	it("anchors the flyout to the other side in RTL", async () => {
		// Arrange, Act
		const menu = await openRail({ dir: "rtl" });

		// Assert
		expect(menu).toHaveAttribute("data-position", "left-start");
	});

	it("labels the rail group and heads the flyout with the same label", async () => {
		// Arrange, Act
		const menu = await openRail();

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute("aria-label", "Group");
		expect(menu).toHaveTextContent("Group");
	});

	it("prefers an explicit aria-label on a rail group", () => {
		// Arrange, Act
		setup({ ...group, "aria-label": "Group of things" }, { collapsed: true });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-label",
			"Group of things",
		);
	});

	it("marks an active rail group with an indicator", () => {
		// Arrange, Act
		setup(group, { collapsed: true, isActive: () => true });

		// Assert
		expect(document.querySelectorAll("span[aria-hidden=true]")).toHaveLength(1);
	});

	it("renders a section child as a flyout label", async () => {
		// Arrange, Act
		await openRail({
			item: {
				...group,
				children: [{ type: "section", id: "s", label: "Group Section" }],
			},
		});

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-label")).toHaveLength(2);
	});

	it("renders a divider child as a flyout divider", async () => {
		// Arrange, Act
		await openRail({
			item: { ...group, children: [{ type: "divider", id: "d" }] },
		});

		// Assert
		await waitFor(() =>
			expect(document.querySelectorAll(".mantine-Menu-divider")).toHaveLength(
				1,
			),
		);
	});

	it("flattens a nested group child into a label plus its children", async () => {
		// Arrange, Act
		const menu = await openRail({
			item: {
				...group,
				children: [
					{
						type: "group",
						id: "sub",
						label: "Nested",
						children: [
							{ type: "link", id: "deep", label: "Deep", href: "/deep" },
						],
					},
				],
			},
		});

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-label")).toHaveLength(2);
		expect(menu).toHaveTextContent("Deep");
	});

	it("renders an external child as a safe anchor", async () => {
		// Arrange, Act
		await openRail({
			item: {
				...group,
				children: [
					{
						type: "link",
						id: "ext",
						label: "Ext",
						href: "https://x.test",
						external: true,
					},
				],
			},
		});

		// Assert
		const item = menuItems()[0]!;
		expect(item).toHaveAttribute("target", "_blank");
		expect(item).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("renders a child with an href as an anchor", async () => {
		// Arrange, Act
		await openRail();

		// Assert
		expect(menuItems()[0]).toHaveAttribute("href", "/child");
	});

	it("uses the router component for a child with an href", async () => {
		// Arrange, Act
		await openRail({ linkComponent: RouterLink });

		// Assert
		expect(screen.getByTestId("router-link")).toBeInTheDocument();
	});

	it("renders an action child without an anchor", async () => {
		// Arrange, Act
		await openRail({
			item: {
				...group,
				children: [{ type: "link", id: "act", label: "Act" }],
			},
		});

		// Assert
		expect(menuItems()[0]).not.toHaveAttribute("href");
	});

	it("reports clicks on a flyout child", async () => {
		// Arrange
		const onItemClick = vi.fn();
		await openRail({ onItemClick });

		// Act
		fireEvent.click(menuItems()[0]!);

		// Assert
		expect(onItemClick).toHaveBeenCalledTimes(1);
	});

	it("suppresses navigation for an action child with no href", async () => {
		// Arrange
		const onClick = vi.fn();
		await openRail({
			item: {
				...group,
				children: [
					{ type: "link", id: "act", label: "Act", onClick },
				],
			},
		});

		// Act
		fireEvent.click(menuItems()[0]!);

		// Assert
		expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(true);
	});

	it("swallows clicks on a disabled flyout child", async () => {
		// Arrange
		const onItemClick = vi.fn();
		await openRail({
			onItemClick,
			item: {
				...group,
				children: [
					{
						type: "link",
						id: "child",
						label: "Child",
						href: "/child",
						disabled: true,
					},
				],
			},
		});

		// Act
		fireEvent.click(menuItems()[0]!);

		// Assert
		expect(onItemClick).not.toHaveBeenCalled();
	});
});
