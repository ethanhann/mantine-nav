import { type AppShellMainProps, MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockViewport, resetViewport } from "../../__integration__/helpers";
import { NavShell, useNavShell } from "./NavShell";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

function ShellConsumer() {
	const ctx = useNavShell();
	return (
		<div>
			<span data-testid="mobile">{String(ctx.mobileOpened)}</span>
			<span data-testid="collapsed">{String(ctx.desktopCollapsed)}</span>
		</div>
	);
}

describe("NavShell", () => {
	it("renders main content", () => {
		render(
			<NavShell>
				<div>Main Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Main Content")).toBeInTheDocument();
	});

	it("renders with header and sidebar", () => {
		render(
			<NavShell header={<span>Logo</span>} sidebar={<span>Nav Items</span>}>
				<div>Page</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Logo")).toBeInTheDocument();
		expect(screen.getByText("Nav Items")).toBeInTheDocument();
		expect(screen.getByText("Page")).toBeInTheDocument();
	});

	it("provides context via useNavShell", () => {
		render(
			<NavShell sidebar={<ShellConsumer />}>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByTestId("mobile")).toHaveTextContent("false");
		expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
	});

	it("useNavShell throws outside provider", () => {
		expect(() => {
			render(<ShellConsumer />, { wrapper: Wrapper });
		}).toThrow("useNavShell() must be used within a <NavShell>");
	});

	it("provides linkComponent via context", () => {
		const FakeLink = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
			<a data-testid="fake-link" {...props} />
		);

		function LinkConsumer() {
			const ctx = useNavShell();
			return (
				<span data-testid="has-link-component">
					{String(!!ctx.linkComponent)}
				</span>
			);
		}

		render(
			<NavShell linkComponent={FakeLink} sidebar={<LinkConsumer />}>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByTestId("has-link-component")).toHaveTextContent("true");
	});

	it("should pass props through to AppShell.main", () => {
		render(
			<NavShell
				mainProps={{ "data-testid": "main-element" } as AppShellMainProps}
				sidebar={<span>Nav Items</span>}
			>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByTestId("main-element")).toBeInTheDocument();
	});

	describe("controlled desktop collapse", () => {
		function CollapseProbe() {
			const ctx = useNavShell();
			return (
				<button type="button" onClick={ctx.toggleDesktop}>
					{String(ctx.desktopCollapsed)}
				</button>
			);
		}

		it("follows the desktopCollapsed prop and reports intent without mutating", async () => {
			// Arrange
			const user = userEvent.setup();
			const onDesktopCollapsedChange = vi.fn();
			const { rerender } = render(
				<NavShell
					desktopCollapsed
					onDesktopCollapsedChange={onDesktopCollapsedChange}
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();

			// Act
			await user.click(screen.getByRole("button", { name: "true" }));

			// Assert
			expect(onDesktopCollapsedChange).toHaveBeenCalledWith(false);
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();
			rerender(
				<MantineProvider>
					<NavShell
						desktopCollapsed={false}
						onDesktopCollapsedChange={onDesktopCollapsedChange}
						sidebar={<CollapseProbe />}
					>
						<div>Content</div>
					</NavShell>
				</MantineProvider>,
			);
			expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
		});

		it("fires onDesktopCollapsedChange in uncontrolled mode and updates state", async () => {
			// Arrange
			const user = userEvent.setup();
			const onDesktopCollapsedChange = vi.fn();
			render(
				<NavShell
					onDesktopCollapsedChange={onDesktopCollapsedChange}
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByRole("button", { name: "false" }));

			// Assert
			expect(onDesktopCollapsedChange).toHaveBeenCalledWith(true);
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();
		});
	});

	describe("mobile drawer", () => {
		beforeEach(() => {
			mockViewport(400);
		});

		afterEach(() => {
			resetViewport();
		});

		function renderMobileShell() {
			return render(
				<NavShell
					header={<span>Logo</span>}
					sidebar={
						<div>
							<a href="/one">One</a>
							<a href="/two">Two</a>
							<button type="button">Action</button>
						</div>
					}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
		}

		it("moves focus into the drawer when it opens", async () => {
			// Arrange
			const user = userEvent.setup();
			renderMobileShell();

			// Act
			await user.click(screen.getByLabelText("Toggle navigation"));

			// Assert
			expect(screen.getByText("One")).toHaveFocus();
		});

		it("returns focus to the previously focused element when closed via Escape", async () => {
			// Arrange
			const user = userEvent.setup();
			renderMobileShell();
			const burger = screen.getByLabelText("Toggle navigation");
			await user.click(burger);

			// Act
			await user.keyboard("{Escape}");

			// Assert
			expect(burger).toHaveFocus();
		});

		it("does not expose the backdrop overlay as a button", async () => {
			// Arrange
			const user = userEvent.setup();
			renderMobileShell();

			// Act
			await user.click(screen.getByLabelText("Toggle navigation"));

			// Assert
			expect(
				screen.queryByRole("button", { name: "Close navigation" }),
			).not.toBeInTheDocument();
		});

		it("wraps Tab focus within the open drawer", async () => {
			// Arrange
			const user = userEvent.setup();
			renderMobileShell();
			await user.click(screen.getByLabelText("Toggle navigation"));
			screen.getByText("Action").focus();

			// Act
			await user.tab();

			// Assert
			expect(screen.getByText("One")).toHaveFocus();
		});

		it("wraps Shift+Tab focus from the first drawer element to the last", async () => {
			// Arrange
			const user = userEvent.setup();
			renderMobileShell();
			await user.click(screen.getByLabelText("Toggle navigation"));
			screen.getByText("One").focus();

			// Act
			await user.tab({ shift: true });

			// Assert
			expect(screen.getByText("Action")).toHaveFocus();
		});
	});
});
