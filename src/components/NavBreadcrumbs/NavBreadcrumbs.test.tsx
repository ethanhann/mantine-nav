import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { NavItemType } from "../../types";
import { NavBreadcrumbs } from "./NavBreadcrumbs";

function Wrapper({ children }: { children: ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const items: NavItemType[] = [
	{
		type: "group",
		id: "settings",
		label: "Settings",
		icon: "settings-icon",
		children: [
			{
				type: "link",
				id: "general",
				label: "General",
				href: "/settings/general",
			},
			{
				type: "group",
				id: "advanced",
				label: "Advanced",
				children: [
					{
						type: "link",
						id: "danger",
						label: "Danger Zone",
						href: "/settings/advanced/danger",
					},
				],
			},
		],
	},
	{
		type: "link",
		id: "about",
		label: "About",
		href: "/about",
	},
];

describe("NavBreadcrumbs", () => {
	it("renders a nav element with aria-label", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs items={items} currentPath="/about" />
			</Wrapper>,
		);

		// Assert
		const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
		expect(nav).toBeInTheDocument();
	});

	it("renders the current page as text with aria-current='page'", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs items={items} currentPath="/about" />
			</Wrapper>,
		);

		// Assert
		const current = screen.getByText("About");
		expect(current).toHaveAttribute("aria-current", "page");
		expect(current.tagName).not.toBe("A");
	});

	it("renders ancestor items as links when they have href", () => {
		// Arrange
		const linkableItems: NavItemType[] = [
			{
				type: "group",
				id: "docs",
				label: "Docs",
				href: "/docs",
				children: [
					{
						type: "link",
						id: "api",
						label: "API",
						href: "/docs/api",
					},
				],
			},
		];

		// Act
		render(
			<Wrapper>
				<NavBreadcrumbs items={linkableItems} currentPath="/docs/api" />
			</Wrapper>,
		);

		// Assert
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(1);
		expect(links[0]).toHaveTextContent("Docs");
		expect(links[0]).toHaveAttribute("href", "/docs");
	});

	it("overrides aria-label via labels.nav", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs
					items={items}
					currentPath="/about"
					labels={{ nav: "Fil d'Ariane" }}
				/>
			</Wrapper>,
		);

		// Assert
		expect(
			screen.getByRole("navigation", { name: "Fil d'Ariane" }),
		).toBeInTheDocument();
	});

	it("renders nothing when no active item", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs items={items} currentPath="/nonexistent" />
			</Wrapper>,
		);

		// Assert
		expect(screen.queryByRole("navigation")).toBeNull();
	});

	it("renders icons when showIcons is true", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs
					items={items}
					currentPath="/settings/general"
					showIcons
				/>
			</Wrapper>,
		);

		// Assert
		expect(screen.getByText("settings-icon")).toBeInTheDocument();
	});

	it("uses renderItem for custom rendering", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs
					items={items}
					currentPath="/settings/general"
					renderItem={(entry) => (
						<span data-testid={`custom-${entry.id}`}>{entry.label}</span>
					)}
				/>
			</Wrapper>,
		);

		// Assert
		expect(screen.getByTestId("custom-settings")).toBeInTheDocument();
		expect(screen.getByTestId("custom-general")).toBeInTheDocument();
	});

	it("renders all segments for a deep path", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs
					items={items}
					currentPath="/settings/advanced/danger"
				/>
			</Wrapper>,
		);

		// Assert
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByText("Advanced")).toBeInTheDocument();
		const current = screen.getByText("Danger Zone");
		expect(current).toHaveAttribute("aria-current", "page");
	});

	it("ancestor groups without href render as text, not links", () => {
		// Arrange / Act
		render(
			<Wrapper>
				<NavBreadcrumbs
					items={items}
					currentPath="/settings/advanced/danger"
				/>
			</Wrapper>,
		);

		// Assert
		const settingsEl = screen.getByText("Settings");
		expect(settingsEl.tagName).not.toBe("A");
		const advancedEl = screen.getByText("Advanced");
		expect(advancedEl.tagName).not.toBe("A");
	});
});
