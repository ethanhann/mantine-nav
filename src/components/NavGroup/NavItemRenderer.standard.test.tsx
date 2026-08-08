import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavItemRenderer } from "./NavItemRenderer";

function _menuItems() {
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

describe("NavItemRenderer dividers and sections", () => {
	it("renders a divider with its label", () => {
		// Arrange, Act
		setup({ type: "divider", id: "d", label: "Section break" });

		// Assert
		expect(screen.getByText("Section break")).toBeInTheDocument();
	});

	it("hides a divider when collapsed", () => {
		// Arrange, Act
		setup(
			{ type: "divider", id: "d", label: "Section break" },
			{
				collapsed: true,
			},
		);

		// Assert
		expect(screen.queryByText("Section break")).not.toBeInTheDocument();
	});

	it("renders a section header with letter spacing", () => {
		// Arrange, Act
		setup({ type: "section", id: "s", label: "Main" });

		// Assert
		expect(screen.getByText("Main")).toHaveStyle({ letterSpacing: "0.05em" });
	});

	it("hides a section when collapsed", () => {
		// Arrange, Act
		setup({ type: "section", id: "s", label: "Main" }, { collapsed: true });

		// Assert
		expect(screen.queryByText("Main")).not.toBeInTheDocument();
	});
});

describe("NavItemRenderer standard links", () => {
	it("opens an external link in a new tab safely", () => {
		// Arrange, Act
		setup({ ...link, external: true });

		// Assert
		const el = screen.getByRole("treeitem");
		expect(el).toHaveAttribute("target", "_blank");
		expect(el).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("uses the router component for an internal link", () => {
		// Arrange, Act
		setup(link, { linkComponent: RouterLink });

		// Assert
		expect(screen.getByTestId("router-link")).toBeInTheDocument();
	});

	it("keeps an external link a plain anchor even with a router component", () => {
		// Arrange, Act
		setup({ ...link, external: true }, { linkComponent: RouterLink });

		// Assert
		expect(screen.queryByTestId("router-link")).not.toBeInTheDocument();
		expect(screen.getByRole("treeitem")).toHaveAttribute("target", "_blank");
	});

	it("routes the href through a custom href prop", () => {
		// Arrange, Act
		setup(link, { linkComponent: RouterLink, hrefProp: "to" });

		// Assert
		expect(screen.getByTestId("router-link")).toHaveAttribute("to", "/alpha");
	});

	it("suppresses navigation for an action link with no href", async () => {
		// Arrange
		const onClick = vi.fn();
		setup({ type: "link", id: "alpha", label: "Alpha", onClick });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(true);
	});

	it("leaves navigation intact for a link with an href", async () => {
		// Arrange
		const onClick = vi.fn();
		setup({ ...link, onClick });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(false);
	});

	it("swallows clicks on a disabled link", async () => {
		// Arrange
		const onItemClick = vi.fn();
		setup({ ...link, disabled: true }, { onItemClick });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onItemClick).not.toHaveBeenCalled();
	});
});

describe("NavItemRenderer standard groups", () => {
	it("reports its expanded state", () => {
		// Arrange, Act
		setup(group, { expandedGroups: new Set(["grp"]) });

		// Assert
		expect(screen.getAllByRole("treeitem")[0]).toHaveAttribute(
			"aria-expanded",
			"true",
		);
	});

	it("reports a collapsed group as not expanded", () => {
		// Arrange, Act
		setup(group);

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-expanded",
			"false",
		);
	});

	it("carries an explicit aria-label", () => {
		// Arrange, Act
		setup({ ...group, "aria-label": "Group of things" });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-label",
			"Group of things",
		);
	});

	it("renders its children", () => {
		// Arrange, Act
		setup(group, { expandedGroups: new Set(["grp"]) });

		// Assert
		expect(screen.getByText("Child")).toBeInTheDocument();
	});

	it("toggles on click and reports the next state", async () => {
		// Arrange
		const onToggleGroup = vi.fn();
		const onGroupToggle = vi.fn();
		setup(group, { onToggleGroup, onGroupToggle });

		// Act
		await userEvent.setup().click(screen.getAllByRole("treeitem")[0]!);

		// Assert
		expect(onToggleGroup).toHaveBeenCalledWith("grp");
		expect(onGroupToggle).toHaveBeenCalledWith(group, true);
	});

	it("swallows clicks on a disabled group", async () => {
		// Arrange
		const onToggleGroup = vi.fn();
		setup({ ...group, disabled: true }, { onToggleGroup });

		// Act
		await userEvent.setup().click(screen.getAllByRole("treeitem")[0]!);

		// Assert
		expect(onToggleGroup).not.toHaveBeenCalled();
	});

	it("stops rendering groups at maxDepth", () => {
		// Arrange, Act
		setup(group, { depth: 3, maxDepth: 3 });

		// Assert
		expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
	});

	it("renders groups just below maxDepth", () => {
		// Arrange, Act
		setup(group, { depth: 2, maxDepth: 3 });

		// Assert
		expect(screen.getAllByRole("treeitem")[0]).toBeInTheDocument();
	});
});
