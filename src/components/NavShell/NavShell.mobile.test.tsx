import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

describe("NavShell drawer focus trap", () => {
	beforeEach(() => {
		mockViewport(400);
	});

	afterEach(() => {
		resetViewport();
	});

	function renderDrawer(sidebar: React.ReactNode) {
		return render(
			<NavShell header={<span>Logo</span>} sidebar={sidebar}>
				<ShellConsumer />
			</NavShell>,
			{ wrapper: Wrapper },
		);
	}

	const links = (
		<div>
			<a href="/one">One</a>
			<a href="/two">Two</a>
		</div>
	);

	async function openDrawer() {
		const user = userEvent.setup();
		await user.click(screen.getByLabelText("Toggle navigation"));
		return user;
	}

	it("wraps focus to the last element on Shift+Tab from the first", async () => {
		// Arrange
		renderDrawer(links);
		const user = await openDrawer();
		const first = screen.getByRole("link", { name: "One" });
		const last = screen.getByRole("link", { name: "Two" });
		expect(first).toHaveFocus();

		// Act
		await user.tab({ shift: true });

		// Assert
		expect(last).toHaveFocus();
	});

	it("wraps focus to the first element on Tab from the last", async () => {
		// Arrange
		renderDrawer(links);
		const user = await openDrawer();
		const first = screen.getByRole("link", { name: "One" });
		const last = screen.getByRole("link", { name: "Two" });
		last.focus();

		// Act
		await user.tab();

		// Assert
		expect(first).toHaveFocus();
	});

	it("leaves focus alone when tabbing within the drawer", async () => {
		// Arrange
		renderDrawer(links);
		const user = await openDrawer();
		const last = screen.getByRole("link", { name: "Two" });

		// Act
		await user.tab();

		// Assert
		expect(last).toHaveFocus();
	});

	it("ignores keys other than Tab", async () => {
		// Arrange
		renderDrawer(links);
		await openDrawer();
		const first = screen.getByRole("link", { name: "One" });

		// Act
		fireEvent.keyDown(first, { key: "a" });

		// Assert
		expect(first).toHaveFocus();
	});

	it("focuses the drawer itself when it holds nothing focusable", async () => {
		// Arrange, Act
		renderDrawer(<span>No controls</span>);
		await openDrawer();

		// Assert
		expect(document.activeElement).toBe(
			document.querySelector(".mantine-AppShell-navbar"),
		);
	});

	it("does not trap Shift+Tab when the drawer holds nothing focusable", async () => {
		// Arrange
		renderDrawer(<span>No controls</span>);
		const user = await openDrawer();
		const navbar = document.querySelector(".mantine-AppShell-navbar");
		expect(document.activeElement).toBe(navbar);

		// Act
		await user.tab({ shift: true });

		// Assert
		expect(document.activeElement).not.toBe(navbar);
	});

	it("closes the drawer on Escape", async () => {
		// Arrange
		renderDrawer(links);
		await openDrawer();

		expect(screen.getByTestId("mobile").textContent).toBe("true");

		// Act
		fireEvent.keyDown(document, { key: "Escape" });

		// Assert
		expect(screen.getByTestId("mobile").textContent).toBe("false");
	});

	it("stops listening for Escape after unmount", () => {
		// Arrange
		const remove = vi.spyOn(document, "removeEventListener");
		const { unmount } = renderDrawer(links);

		// Act
		unmount();

		// Assert
		expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
		remove.mockRestore();
	});
});
