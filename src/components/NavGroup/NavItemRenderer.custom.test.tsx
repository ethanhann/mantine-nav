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

const _RouterLink = (props: Record<string, unknown>) => (
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

describe("NavItemRenderer custom renderItem", () => {
	const renderItem = (item: NavItemType) => <span>custom {item.label}</span>;

	it("wraps a divider in a presentation role rather than a treeitem", () => {
		// Arrange, Act
		setup({ type: "divider", id: "d" }, { renderItem });

		// Assert
		expect(screen.getByRole("presentation")).toBeInTheDocument();
		expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
	});

	it("wraps a section in a presentation role rather than a treeitem", () => {
		// Arrange, Act
		setup({ type: "section", id: "s", label: "Sec" }, { renderItem });

		// Assert
		expect(screen.getByRole("presentation")).toBeInTheDocument();
		expect(screen.queryByRole("treeitem")).not.toBeInTheDocument();
	});

	it("exposes active state on a custom link", () => {
		// Arrange, Act
		setup(link, { renderItem, isActive: () => true });

		// Assert
		const el = screen.getByRole("treeitem");
		expect(el).toHaveAttribute("data-item-id", "alpha");
		expect(el).toHaveAttribute("aria-current", "page");
		expect(el).toHaveAttribute("aria-selected", "true");
		expect(el).not.toHaveAttribute("aria-expanded");
	});

	it("omits aria-current on an inactive custom link", () => {
		// Arrange, Act
		setup(link, { renderItem });

		// Assert
		const el = screen.getByRole("treeitem");
		expect(el).not.toHaveAttribute("aria-current");
		expect(el).toHaveAttribute("aria-selected", "false");
	});

	it("exposes expanded state on a custom group", () => {
		// Arrange, Act
		setup(group, { renderItem, expandedGroups: new Set(["grp"]) });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-expanded",
			"true",
		);
	});

	it("reports a collapsed custom group as not expanded", () => {
		// Arrange, Act
		setup(group, { renderItem });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-expanded",
			"false",
		);
	});

	it("marks a disabled custom item and swallows its clicks", async () => {
		// Arrange
		const onItemClick = vi.fn();
		setup({ ...link, disabled: true }, { renderItem, onItemClick });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		expect(onItemClick).not.toHaveBeenCalled();
	});

	it("suppresses navigation for a custom action link with no href", async () => {
		// Arrange
		const onClick = vi.fn();
		const onItemClick = vi.fn();
		setup(
			{ type: "link", id: "alpha", label: "Alpha", onClick },
			{ renderItem, onItemClick },
		);

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(true);
		expect(onItemClick).toHaveBeenCalledTimes(1);
	});

	it("leaves navigation intact for a custom link with an href", async () => {
		// Arrange
		const onClick = vi.fn();
		setup({ ...link, onClick }, { renderItem });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(false);
	});

	it("toggles a custom group and reports the next expanded state", async () => {
		// Arrange
		const onToggleGroup = vi.fn();
		const onGroupToggle = vi.fn();
		setup(group, { renderItem, onToggleGroup, onGroupToggle });

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onToggleGroup).toHaveBeenCalledWith("grp");
		expect(onGroupToggle).toHaveBeenCalledWith(group, true);
	});

	it("reports collapsing when the custom group is already expanded", async () => {
		// Arrange
		const onGroupToggle = vi.fn();
		setup(group, {
			renderItem,
			onGroupToggle,
			expandedGroups: new Set(["grp"]),
		});

		// Act
		await userEvent.setup().click(screen.getByRole("treeitem"));

		// Assert
		expect(onGroupToggle).toHaveBeenCalledWith(group, false);
	});

	it("omits tabindex entirely when no item holds the roving focus", () => {
		// Arrange, Act
		setup(link, { renderItem, rovingItemId: null });

		// Assert
		expect(screen.getByRole("treeitem")).not.toHaveAttribute("tabindex");
	});

	it("gives the roving item tabindex 0 and others tabindex -1", () => {
		// Arrange, Act
		setup(link, { renderItem, rovingItemId: "alpha" });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute("tabindex", "0");
	});

	it("gives a non-roving item tabindex -1", () => {
		// Arrange, Act
		setup(link, { renderItem, rovingItemId: "other" });

		// Assert
		expect(screen.getByRole("treeitem")).toHaveAttribute("tabindex", "-1");
	});
});
