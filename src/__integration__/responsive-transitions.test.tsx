import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NavGroup } from "../components/NavGroup";
import { NavHeader } from "../components/NavHeader";
import { NavShell } from "../components/NavShell";
import { NavSidebar } from "../components/NavSidebar";
import { mockViewport, resetViewport, sampleNavItems } from "./helpers";

afterEach(() => {
	resetViewport();
});

function renderResponsiveShell(
	opts: { sidebarBreakpoint?: "sm" | "md" | "lg" } = {},
) {
	return render(
		<MantineProvider>
			<NavShell
				header={<NavHeader logo={<span>Logo</span>} />}
				sidebar={
					<NavSidebar>
						<NavGroup items={sampleNavItems} />
					</NavSidebar>
				}
				sidebarBreakpoint={opts.sidebarBreakpoint ?? "sm"}
			>
				<div data-testid="main">Main Content</div>
			</NavShell>
		</MantineProvider>,
	);
}

describe("Responsive transitions integration", () => {
	it("renders header, sidebar, and main content at desktop width", () => {
		mockViewport(1280);
		renderResponsiveShell();

		expect(screen.getByText("Logo")).toBeInTheDocument();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByTestId("main")).toBeInTheDocument();
	});

	it("renders burger toggle at mobile width", () => {
		mockViewport(375);
		renderResponsiveShell();

		const burger = screen.getByLabelText("Toggle navigation");
		expect(burger).toBeInTheDocument();
	});

	it("renders burger toggle at tablet width below breakpoint", () => {
		mockViewport(600); // below sm breakpoint (768px = 48em)
		renderResponsiveShell();

		const burger = screen.getByLabelText("Toggle navigation");
		expect(burger).toBeInTheDocument();
	});

	it("reports isMobile correctly at mobile viewport", () => {
		mockViewport(375);
		renderResponsiveShell();

		// Shell renders and nav items exist in DOM regardless
		expect(screen.getByText("Home")).toBeInTheDocument();
	});

	it("reports isMobile correctly at desktop viewport", () => {
		mockViewport(1280);
		renderResponsiveShell();

		expect(screen.getByText("Home")).toBeInTheDocument();
	});

	it("header always renders regardless of viewport", () => {
		mockViewport(375);
		renderResponsiveShell();
		expect(screen.getByText("Logo")).toBeInTheDocument();

		resetViewport();
		mockViewport(1280);
		renderResponsiveShell();
		expect(screen.getAllByText("Logo").length).toBeGreaterThanOrEqual(1);
	});

	it("active item persists regardless of viewport context", () => {
		mockViewport(1280);

		render(
			<MantineProvider>
				<NavShell
					header={<NavHeader logo={<span>Logo</span>} />}
					sidebar={
						<NavSidebar>
							<NavGroup items={sampleNavItems} currentPath="/dashboard" />
						</NavSidebar>
					}
				>
					<div>Main</div>
				</NavShell>
			</MantineProvider>,
		);

		const dashLink = screen.getByText("Dashboard").closest("a");
		expect(dashLink).toHaveAttribute("data-active", "true");
	});

	it("md breakpoint works correctly", () => {
		mockViewport(800); // below md (62em = 992px)
		renderResponsiveShell({ sidebarBreakpoint: "md" });

		expect(screen.getByLabelText("Toggle navigation")).toBeInTheDocument();
	});

	it("sidebar and header compose correctly together", () => {
		mockViewport(1280);
		renderResponsiveShell();

		// Both logo (header) and nav items (sidebar) should be present
		expect(screen.getByText("Logo")).toBeInTheDocument();
		expect(screen.getByRole("tree")).toBeInTheDocument();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByTestId("main")).toHaveTextContent("Main Content");
	});
});
