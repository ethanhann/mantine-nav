import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../../types";
import { NavShell } from "../NavShell";
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

	it("fires onNavigate with source 'breadcrumb' when an ancestor link is clicked", async () => {
		// Arrange
		const user = userEvent.setup();
		const onNavigate = vi.fn();
		const linkableItems: NavItemType[] = [
			{
				type: "group",
				id: "docs",
				label: "Docs",
				href: "/docs",
				children: [
					{ type: "link", id: "api", label: "API", href: "/docs/api" },
				],
			},
		];
		render(
			<Wrapper>
				<NavShell onNavigate={onNavigate}>
					<NavBreadcrumbs items={linkableItems} currentPath="/docs/api" />
				</NavShell>
			</Wrapper>,
		);

		// Act
		await user.click(screen.getByRole("link", { name: "Docs" }));

		// Assert
		expect(onNavigate).toHaveBeenCalledTimes(1);
		expect(onNavigate).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "docs",
				label: "Docs",
				href: "/docs",
				source: "breadcrumb",
				trigger: "mouse",
			}),
		);
	});

	it("does not fire onNavigate for the current page entry", async () => {
		// Arrange
		const user = userEvent.setup();
		const onNavigate = vi.fn();
		render(
			<Wrapper>
				<NavShell onNavigate={onNavigate}>
					<NavBreadcrumbs items={items} currentPath="/about" />
				</NavShell>
			</Wrapper>,
		);

		// Act
		await user.click(screen.getByText("About"));

		// Assert
		expect(onNavigate).not.toHaveBeenCalled();
	});
});
