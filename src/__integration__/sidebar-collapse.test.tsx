import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NavGroup } from "../components/NavGroup";
import { NavShell, useNavShell } from "../components/NavShell";
import { NavSidebar } from "../components/NavSidebar";
import { resetViewport, sampleNavItems } from "./helpers";

afterEach(() => {
	resetViewport();
});

// Helper that reads context values for assertions
function ContextReader() {
	const { desktopCollapsed, mobileOpened } = useNavShell();
	return (
		<div data-testid="ctx">
			<span data-testid="collapsed">{String(desktopCollapsed)}</span>
			<span data-testid="mobile-opened">{String(mobileOpened)}</span>
		</div>
	);
}

function renderShellWithSidebar(
	opts: { defaultDesktopCollapsed?: boolean } = {},
) {
	return render(
		<MantineProvider>
			<NavShell
				sidebar={
					<NavSidebar footer={<ContextReader />}>
						<NavGroup items={sampleNavItems} />
					</NavSidebar>
				}
				defaultDesktopCollapsed={opts.defaultDesktopCollapsed}
			>
				<div data-testid="main">Main</div>
			</NavShell>
		</MantineProvider>,
	);
}

describe("Sidebar collapse integration", () => {
	it("renders sidebar with nav items in expanded state by default", () => {
		renderShellWithSidebar();

		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("Dashboard")).toBeInTheDocument();
		expect(screen.getByText("Settings")).toBeInTheDocument();
		expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
	});

	it("collapses sidebar when toggle is clicked", async () => {
		const user = userEvent.setup();
		renderShellWithSidebar();

		expect(screen.getByTestId("collapsed")).toHaveTextContent("false");

		const collapseBtn = screen.getByLabelText("Collapse sidebar");
		await user.click(collapseBtn);

		expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
	});

	it("expands sidebar when toggle is clicked again", async () => {
		const user = userEvent.setup();
		renderShellWithSidebar();

		const collapseBtn = screen.getByLabelText("Collapse sidebar");
		await user.click(collapseBtn);
		expect(screen.getByTestId("collapsed")).toHaveTextContent("true");

		const expandBtn = screen.getByLabelText("Expand sidebar");
		await user.click(expandBtn);
		expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
	});

	it("starts collapsed when defaultDesktopCollapsed is true", () => {
		renderShellWithSidebar({ defaultDesktopCollapsed: true });
		expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
	});

	it("toggle button label updates with collapse state", async () => {
		const user = userEvent.setup();
		renderShellWithSidebar();

		expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();

		await user.click(screen.getByLabelText("Collapse sidebar"));

		expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
	});

	it("nav items remain in DOM after collapse in icon rail mode", async () => {
		const user = userEvent.setup();
		renderShellWithSidebar();

		await user.click(screen.getByLabelText("Collapse sidebar"));

		// Items should still exist in the DOM as icon-only with aria-labels
		expect(screen.getByLabelText("Home")).toBeInTheDocument();
		expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
	});

	it("mobile toggle works independently from desktop collapse", async () => {
		const user = userEvent.setup();
		renderShellWithSidebar();

		// Collapse desktop
		await user.click(screen.getByLabelText("Collapse sidebar"));
		expect(screen.getByTestId("collapsed")).toHaveTextContent("true");

		// Mobile state is independent
		expect(screen.getByTestId("mobile-opened")).toHaveTextContent("false");
	});

	it("renders burger for mobile navigation toggle when header is present", () => {
		render(
			<MantineProvider>
				<NavShell
					header={<span>Logo</span>}
					sidebar={
						<NavSidebar footer={<ContextReader />}>
							<NavGroup items={sampleNavItems} />
						</NavSidebar>
					}
				>
					<div>Main</div>
				</NavShell>
			</MantineProvider>,
		);

		const burger = screen.getByLabelText("Toggle navigation");
		expect(burger).toBeInTheDocument();
	});

	it("mobile burger toggles mobileOpened state", async () => {
		const user = userEvent.setup();

		render(
			<MantineProvider>
				<NavShell
					header={<span>Logo</span>}
					sidebar={
						<NavSidebar footer={<ContextReader />}>
							<NavGroup items={sampleNavItems} />
						</NavSidebar>
					}
				>
					<div>Main</div>
				</NavShell>
			</MantineProvider>,
		);

		expect(screen.getByTestId("mobile-opened")).toHaveTextContent("false");

		const burger = screen.getByLabelText("Toggle navigation");
		await user.click(burger);

		expect(screen.getByTestId("mobile-opened")).toHaveTextContent("true");
	});
});
