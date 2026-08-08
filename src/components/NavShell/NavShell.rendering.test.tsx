import { type AppShellMainProps, MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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

describe("NavShell rendering", () => {
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
});

describe("NavShell optional regions", () => {
	function renderShell(props: Record<string, unknown> = {}) {
		return render(
			<NavShell sidebar={<span>Nav</span>} {...props}>
				<span>Content</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);
	}

	it("renders no aside when none is given", () => {
		// Arrange, Act
		renderShell();

		// Assert
		expect(document.querySelector(".mantine-AppShell-aside")).toBeNull();
	});

	it("renders the aside when one is given", () => {
		// Arrange, Act
		renderShell({ aside: <span>Aside</span> });

		// Assert
		expect(screen.getByText("Aside")).toBeInTheDocument();
	});

	it("renders no footer when none is given", () => {
		// Arrange, Act
		renderShell();

		// Assert
		expect(document.querySelector(".mantine-AppShell-footer")).toBeNull();
	});

	it("renders the footer when one is given", () => {
		// Arrange, Act
		renderShell({ footer: <span>Footer</span> });

		// Assert
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("renders no header when none is given", () => {
		// Arrange, Act
		renderShell();

		// Assert
		expect(document.querySelector(".mantine-AppShell-header")).toBeNull();
	});

	it("applies the default header height", () => {
		// Arrange, Act
		renderShell({ header: <span>H</span> });

		// Assert
		expect(document.documentElement.innerHTML).toContain(
			"--app-shell-header-height",
		);
	});

	it("narrows the navbar when collapsed", () => {
		// Arrange, Act
		renderShell({ desktopCollapsed: true });

		// Assert
		expect(document.documentElement.innerHTML).toContain(
			"--app-shell-navbar-width:calc(5rem",
		);
	});

	it("uses the full navbar width when expanded", () => {
		// Arrange, Act
		renderShell({ desktopCollapsed: false });

		// Assert
		expect(document.documentElement.innerHTML).toContain(
			"--app-shell-navbar-width:calc(16.25rem",
		);
	});
});

describe("NavShell mobile overlay", () => {
	beforeEach(() => {
		mockViewport(400);
	});

	afterEach(() => {
		resetViewport();
	});

	function overlay() {
		return document.querySelector(".mantine-Overlay-root");
	}

	it("shows no overlay while the drawer is closed", () => {
		// Arrange, Act
		render(
			<NavShell header={<span>Logo</span>} sidebar={<span>Nav</span>}>
				<span>Content</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(overlay()).toBeNull();
	});

	it("shows an overlay while the drawer is open and closes on click", async () => {
		// Arrange
		const user = userEvent.setup();
		render(
			<NavShell header={<span>Logo</span>} sidebar={<span>Nav</span>}>
				<span>Content</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);
		await user.click(screen.getByLabelText("Toggle navigation"));
		expect(overlay()).not.toBeNull();

		// Act
		await user.click(overlay() as HTMLElement);

		// Assert
		expect(overlay()).toBeNull();
	});
});

describe("NavBurger", () => {
	it("renders nothing outside a shell", () => {
		// Arrange, Act
		render(<NavBurger />, { wrapper: Wrapper });

		// Assert
		expect(document.querySelector(".mantine-Burger-root")).toBeNull();
	});

	it("names itself Toggle navigation by default", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<span>Nav</span>}>
				<NavBurger />
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByLabelText("Toggle navigation")).toBeInTheDocument();
	});
});
