import { DirectionProvider, MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NavShell } from "../NavShell";
import { NavSidebar } from "./NavSidebar";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("NavSidebar", () => {
	it("renders header, body, and footer sections", () => {
		// Arrange

		// Act
		render(
			<NavSidebar header={<span>Header</span>} footer={<span>Footer</span>}>
				<span>Body</span>
			</NavSidebar>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("Header")).toBeInTheDocument();
		expect(screen.getByText("Body")).toBeInTheDocument();
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("does not clamp expanded sections to a fixed max height", () => {
		// Arrange

		// Act
		const { container } = render(
			<NavSidebar header={<span>Header</span>} footer={<span>Footer</span>}>
				<span>Body</span>
			</NavSidebar>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(container.innerHTML).not.toContain("max-height: 500px");
	});

	it("toggles the shell collapse state via the collapse toggle", async () => {
		// Arrange
		const user = userEvent.setup();
		render(
			<NavShell
				sidebar={
					<NavSidebar footer={<span>Footer</span>}>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Act
		await user.click(screen.getByLabelText("Collapse sidebar"));

		// Assert
		expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
	});

	it("hides the collapse toggle when showCollapseToggle is false", () => {
		// Arrange

		// Act
		render(
			<NavShell
				sidebar={
					<NavSidebar showCollapseToggle={false}>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.queryByLabelText("Collapse sidebar")).not.toBeInTheDocument();
	});

	it("applies custom labels to the collapse toggle", () => {
		// Arrange

		// Act
		render(
			<NavShell
				sidebar={
					<NavSidebar labels={{ collapseSidebar: "Seitenleiste einklappen" }}>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(
			screen.getByLabelText("Seitenleiste einklappen"),
		).toBeInTheDocument();
	});

	it("applies classNames and styles to sidebar slots", () => {
		// Arrange

		// Act
		const { container } = render(
			<NavShell
				sidebar={
					<NavSidebar
						header={<span>Header</span>}
						footer={<span>Footer</span>}
						classNames={{
							header: "custom-sh",
							body: "custom-sb",
							footer: "custom-sf",
						}}
						styles={{ body: { backgroundColor: "rgb(4, 5, 6)" } }}
					>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(container.querySelector(".custom-sh")).not.toBeNull();
		const body = container.querySelector(".custom-sb");
		expect(body).not.toBeNull();
		expect(body).toHaveStyle({ backgroundColor: "rgb(4, 5, 6)" });
		expect(container.querySelector(".custom-sf")).not.toBeNull();
	});

	it("renders standalone without a NavShell", () => {
		// Arrange

		// Act
		render(<NavSidebar>Body</NavSidebar>, { wrapper: Wrapper });

		// Assert
		expect(screen.getByText("Body")).toBeInTheDocument();
		expect(screen.queryByLabelText("Collapse sidebar")).not.toBeInTheDocument();
	});
});

function Rtl({ children }: { children: React.ReactNode }) {
	return (
		<DirectionProvider initialDirection="rtl" detectDirection={false}>
			<MantineProvider>{children}</MantineProvider>
		</DirectionProvider>
	);
}

function chevronStyle() {
	return document.querySelector("svg")?.getAttribute("style") ?? "";
}

function sections() {
	return document.querySelectorAll(".mantine-AppShell-section");
}

function toggles() {
	return screen.queryAllByRole("button", {
		name: /sidebar|fold/i,
		hidden: true,
	});
}

function inShell(ui: React.ReactNode, collapsed = false) {
	return render(
		<NavShell desktopCollapsed={collapsed} sidebar={ui}>
			<div />
		</NavShell>,
		{ wrapper: Wrapper },
	);
}

describe("NavSidebar collapse toggle", () => {
	it("offers to collapse while the sidebar is expanded", () => {
		// Arrange, Act
		inShell(<NavSidebar>body</NavSidebar>);

		// Assert
		expect(toggles()[0]).toHaveAttribute("aria-label", "Collapse sidebar");
	});

	it("offers to expand while the sidebar is collapsed", () => {
		// Arrange, Act
		inShell(<NavSidebar>body</NavSidebar>, true);

		// Assert
		expect(toggles()[0]).toHaveAttribute("aria-label", "Expand sidebar");
	});

	it("honors custom toggle labels", () => {
		// Arrange, Act
		inShell(
			<NavSidebar labels={{ collapseSidebar: "Fold", expandSidebar: "Unfold" }}>
				body
			</NavSidebar>,
		);

		// Assert
		expect(toggles()[0]).toHaveAttribute("aria-label", "Fold");
	});

	it("leaves the chevron untransformed when expanded in LTR", () => {
		// Arrange, Act
		inShell(<NavSidebar>body</NavSidebar>);

		// Assert
		expect(chevronStyle()).toBe("transition: transform 200ms ease;");
	});

	it("rotates the chevron when collapsed", () => {
		// Arrange, Act
		inShell(<NavSidebar>body</NavSidebar>, true);

		// Assert
		expect(chevronStyle()).toBe(
			"transform: rotate(180deg); transition: transform 200ms ease;",
		);
	});

	it("mirrors the chevron in RTL", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<NavSidebar>body</NavSidebar>}>
				<div />
			</NavShell>,
			{ wrapper: Rtl },
		);

		// Assert
		expect(chevronStyle()).toBe(
			"transform: scaleX(-1); transition: transform 200ms ease;",
		);
	});

	it("both rotates and mirrors when collapsed in RTL", () => {
		// Arrange, Act
		render(
			<NavShell desktopCollapsed sidebar={<NavSidebar>body</NavSidebar>}>
				<div />
			</NavShell>,
			{ wrapper: Rtl },
		);

		// Assert
		expect(chevronStyle()).toBe(
			"transform: rotate(180deg) scaleX(-1); transition: transform 200ms ease;",
		);
	});

	it("hides the toggle on mobile", () => {
		// Arrange
		const original = window.matchMedia;
		window.matchMedia = ((query: string) => ({
			matches: true,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		})) as unknown as typeof window.matchMedia;

		// Act
		inShell(<NavSidebar>body</NavSidebar>);

		// Assert
		expect(toggles()).toHaveLength(0);
		window.matchMedia = original;
	});

	it("omits the toggle entirely when disabled", () => {
		// Arrange, Act
		inShell(<NavSidebar showCollapseToggle={false}>body</NavSidebar>);

		// Assert
		expect(toggles()).toHaveLength(0);
	});

	it("renders no toggle outside a shell", () => {
		// Arrange, Act
		render(<NavSidebar>body</NavSidebar>, { wrapper: Wrapper });

		// Assert
		expect(toggles()).toHaveLength(0);
	});
});

describe("NavSidebar sections", () => {
	it("uses AppShell sections inside a shell", () => {
		// Arrange, Act
		inShell(
			<NavSidebar header={<span>H</span>} footer={<span>F</span>}>
				<span>B</span>
			</NavSidebar>,
		);

		// Assert
		expect(sections()).toHaveLength(3);
	});

	it("adds a trailing toggle section when collapsed", () => {
		// Arrange, Act
		inShell(
			<NavSidebar header={<span>H</span>} footer={<span>F</span>}>
				<span>B</span>
			</NavSidebar>,
			true,
		);

		// Assert
		expect(sections()).toHaveLength(4);
	});

	it("uses plain elements outside a shell", () => {
		// Arrange, Act
		render(
			<NavSidebar header={<span>H</span>} footer={<span>F</span>}>
				<span>B</span>
			</NavSidebar>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(sections()).toHaveLength(0);
		expect(screen.getByText("H")).toBeInTheDocument();
		expect(screen.getByText("F")).toBeInTheDocument();
	});

	it("wraps the standalone body in a growing scroll area", () => {
		// Arrange, Act
		render(<NavSidebar>body</NavSidebar>, { wrapper: Wrapper });

		// Assert
		const area = document.querySelector(".mantine-ScrollArea-root");
		expect(area).toHaveStyle({ flex: 1 });
	});

	it("renders only header and body when nothing needs a footer", () => {
		// Arrange, Act
		inShell(
			<NavSidebar header={<span>H</span>} showCollapseToggle={false}>
				<span>B</span>
			</NavSidebar>,
		);

		// Assert
		expect(sections()).toHaveLength(2);
	});

	it("places the toggle in the header when configured", () => {
		// Arrange, Act
		inShell(
			<NavSidebar header={<span>H</span>} collapseTogglePosition="header">
				<span>B</span>
			</NavSidebar>,
		);

		// Assert
		expect(sections()[0]).toContainElement(toggles()[0]!);
		expect(sections()).toHaveLength(2);
	});

	it("places the toggle in the footer by default", () => {
		// Arrange, Act
		inShell(
			<NavSidebar header={<span>H</span>}>
				<span>B</span>
			</NavSidebar>,
		);

		// Assert
		expect(sections()[2]).toContainElement(toggles()[0]!);
	});
});
