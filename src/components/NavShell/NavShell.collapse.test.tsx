import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

function CollapseToggler() {
	const ctx = useNavShell();
	return (
		<>
			<button type="button" onClick={ctx.toggleDesktop}>
				toggle-desktop
			</button>
			<button type="button" onClick={ctx.collapseDesktop}>
				collapse-desktop
			</button>
			<button type="button" onClick={ctx.expandDesktop}>
				expand-desktop
			</button>
		</>
	);
}

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

describe("NavShell collapse controls", () => {
	const KEY = "shell-controls";

	beforeEach(() => {
		localStorage.clear();
	});

	function renderShell(props: Record<string, unknown> = {}) {
		return render(
			<NavShell sidebar={<span>Nav</span>} {...props}>
				<ShellConsumer />
				<CollapseToggler />
			</NavShell>,
			{ wrapper: Wrapper },
		);
	}

	function collapsed() {
		return screen.getByTestId("collapsed").textContent;
	}

	it("collapseDesktop collapses and expandDesktop expands", async () => {
		// Arrange
		const user = userEvent.setup();
		renderShell();

		// Act
		await user.click(screen.getByText("collapse-desktop"));

		// Assert
		expect(collapsed()).toBe("true");
		await user.click(screen.getByText("expand-desktop"));
		expect(collapsed()).toBe("false");
	});

	it("leaves internal state alone in controlled mode", async () => {
		// Arrange
		const onChange = vi.fn();
		renderShell({
			desktopCollapsed: false,
			onDesktopCollapsedChange: onChange,
		});

		// Act
		await userEvent.setup().click(screen.getByText("toggle-desktop"));

		// Assert
		expect(collapsed()).toBe("false");
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("writes nothing in controlled mode even with a persist key", async () => {
		// Arrange
		renderShell({ collapsePersistKey: KEY, desktopCollapsed: false });

		// Act
		await userEvent.setup().click(screen.getByText("toggle-desktop"));

		// Assert
		expect(localStorage.getItem(KEY)).toBeNull();
	});

	it("writes nothing without a persist key", async () => {
		// Arrange
		renderShell();

		// Act
		await userEvent.setup().click(screen.getByText("toggle-desktop"));

		// Assert
		expect(localStorage.length).toBe(0);
	});

	it("writes on every toggle, not just the first", async () => {
		// Arrange
		const user = userEvent.setup();
		renderShell({ collapsePersistKey: KEY });

		// Act
		await user.click(screen.getByText("toggle-desktop"));
		await user.click(screen.getByText("toggle-desktop"));

		// Assert
		expect(localStorage.getItem(KEY)).toBe("false");
		expect(collapsed()).toBe("false");
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
	});
});
