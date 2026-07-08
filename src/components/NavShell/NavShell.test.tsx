import { type AppShellMainProps, MantineProvider } from "@mantine/core";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockViewport, resetViewport } from "../../__integration__/helpers";
import { NavBurger, NavShell, useNavShell } from "./NavShell";

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

	it("applies custom labels to the burger", () => {
		// Arrange
		mockViewport(400);

		// Act
		render(
			<NavShell
				header={<span>Logo</span>}
				sidebar={<span>Nav</span>}
				labels={{ toggleNavigation: "Menü öffnen" }}
			>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByLabelText("Menü öffnen")).toBeInTheDocument();
		resetViewport();
	});

	it("applies asideWidth and footerHeight to the AppShell", () => {
		// Arrange

		// Act
		const { container } = render(
			<NavShell
				aside={<span>Aside</span>}
				footer={<span>Footer</span>}
				asideWidth={340}
				footerHeight={72}
			>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(container.innerHTML).toMatch(
			/--app-shell-aside-width:\s*calc\(21\.25rem/,
		);
		expect(container.innerHTML).toMatch(
			/--app-shell-footer-height:\s*calc\(4\.5rem/,
		);
	});

	it("NavBurger toggles the mobile drawer in a header-less layout", async () => {
		// Arrange
		mockViewport(400);
		const user = userEvent.setup();
		function Probe() {
			const ctx = useNavShell();
			return <span data-testid="opened">{String(ctx.mobileOpened)}</span>;
		}
		render(
			<NavShell sidebar={<span>Nav</span>}>
				<NavBurger aria-label="Open menu" />
				<Probe />
			</NavShell>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByTestId("opened")).toHaveTextContent("false");

		// Act
		await user.click(screen.getByLabelText("Open menu"));

		// Assert
		expect(screen.getByTestId("opened")).toHaveTextContent("true");
		resetViewport();
	});

	it("applies classNames and styles to shell slots", () => {
		// Arrange

		// Act
		const { container } = render(
			<NavShell
				header={<span>Logo</span>}
				sidebar={<span>Nav</span>}
				classNames={{ navbar: "custom-navbar", header: "custom-header" }}
				styles={{ navbar: { backgroundColor: "rgb(1, 2, 3)" } }}
			>
				<div>Content</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		const navbar = container.querySelector(".custom-navbar");
		expect(navbar).not.toBeNull();
		expect(navbar).toHaveStyle({ backgroundColor: "rgb(1, 2, 3)" });
		expect(container.querySelector(".custom-header")).not.toBeNull();
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

	describe("collapse persistence", () => {
		const PERSIST_KEY = "test-nav-collapse";

		function CollapseProbe() {
			const ctx = useNavShell();
			return (
				<button type="button" onClick={ctx.toggleDesktop}>
					{String(ctx.desktopCollapsed)}
				</button>
			);
		}

		beforeEach(() => {
			localStorage.removeItem(PERSIST_KEY);
		});

		it("reads initial collapsed state from localStorage", () => {
			// Arrange
			localStorage.setItem(PERSIST_KEY, "true");

			// Act
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();
		});

		it("reads initial expanded state from localStorage", () => {
			// Arrange
			localStorage.setItem(PERSIST_KEY, "false");

			// Act
			render(
				<NavShell
					collapsePersistKey={PERSIST_KEY}
					defaultDesktopCollapsed
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
		});

		it("falls back to defaultDesktopCollapsed when no stored value exists", () => {
			// Arrange (no localStorage entry)

			// Act
			render(
				<NavShell
					collapsePersistKey={PERSIST_KEY}
					defaultDesktopCollapsed
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();
		});

		it("falls back to defaultDesktopCollapsed when stored value is invalid", () => {
			// Arrange
			localStorage.setItem(PERSIST_KEY, "garbage");

			// Act
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
		});

		it("writes state changes to localStorage on toggle", async () => {
			// Arrange
			const user = userEvent.setup();
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByRole("button", { name: "false" }));

			// Assert
			expect(localStorage.getItem(PERSIST_KEY)).toBe("true");
		});

		it("does not touch localStorage when collapsePersistKey is not set", async () => {
			// Arrange
			const user = userEvent.setup();
			const spy = vi.spyOn(Storage.prototype, "setItem");
			render(
				<NavShell sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			await user.click(screen.getByRole("button", { name: "false" }));

			// Assert
			const callKeys = spy.mock.calls.map((c) => c[0]);
			expect(callKeys).not.toContain(PERSIST_KEY);
			spy.mockRestore();
		});

		it("ignores collapsePersistKey when desktopCollapsed (controlled) is set", () => {
			// Arrange
			localStorage.setItem(PERSIST_KEY, "true");

			// Act
			render(
				<NavShell
					desktopCollapsed={false}
					collapsePersistKey={PERSIST_KEY}
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
		});
	});

	describe("collapse cross-tab sync", () => {
		const PERSIST_KEY = "test-collapse-sync";

		function CollapseProbe() {
			const ctx = useNavShell();
			return (
				<button type="button" onClick={ctx.toggleDesktop}>
					{String(ctx.desktopCollapsed)}
				</button>
			);
		}

		function fireStorageEvent(key: string, newValue: string | null) {
			window.dispatchEvent(
				new StorageEvent("storage", { key, newValue }),
			);
		}

		beforeEach(() => {
			localStorage.removeItem(PERSIST_KEY);
		});

		it("updates collapse state when another tab writes 'true'", () => {
			// Arrange
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();

			// Act
			act(() => fireStorageEvent(PERSIST_KEY, "true"));

			// Assert
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();
		});

		it("updates collapse state when another tab writes 'false'", () => {
			// Arrange
			localStorage.setItem(PERSIST_KEY, "true");
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);
			expect(screen.getByRole("button", { name: "true" })).toBeInTheDocument();

			// Act
			act(() => fireStorageEvent(PERSIST_KEY, "false"));

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
		});

		it("ignores invalid values from another tab", () => {
			// Arrange
			render(
				<NavShell collapsePersistKey={PERSIST_KEY} sidebar={<CollapseProbe />}>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			act(() => fireStorageEvent(PERSIST_KEY, "garbage"));

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
		});

		it("does not sync when controlled mode is active", () => {
			// Arrange
			render(
				<NavShell
					desktopCollapsed={false}
					collapsePersistKey={PERSIST_KEY}
					sidebar={<CollapseProbe />}
				>
					<div>Content</div>
				</NavShell>,
				{ wrapper: Wrapper },
			);

			// Act
			act(() => fireStorageEvent(PERSIST_KEY, "true"));

			// Assert
			expect(
				screen.getByRole("button", { name: "false" }),
			).toBeInTheDocument();
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
