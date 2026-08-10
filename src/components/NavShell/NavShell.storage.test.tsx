import { MantineProvider } from "@mantine/core";
import { act, render, screen } from "@testing-library/react";
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
		window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
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
		expect(screen.getByRole("button", { name: "false" })).toBeInTheDocument();
	});
});

describe("NavShell collapse persistence edges", () => {
	const KEY = "shell-collapsed";

	beforeEach(() => {
		localStorage.clear();
	});

	function renderShell(props: Record<string, unknown> = {}) {
		return render(
			<NavShell collapsePersistKey={KEY} sidebar={<span>Nav</span>} {...props}>
				<ShellConsumer />
				<CollapseToggler />
			</NavShell>,
			{ wrapper: Wrapper },
		);
	}

	function collapsed() {
		return screen.getByTestId("collapsed").textContent;
	}

	it("does not write to storage on mount", () => {
		// Arrange, Act
		renderShell();

		// Assert
		expect(localStorage.getItem(KEY)).toBeNull();
	});

	it("writes the collapsed state on toggle", async () => {
		// Arrange
		renderShell();

		// Act
		await userEvent.setup().click(screen.getByText("toggle-desktop"));

		// Assert
		expect(localStorage.getItem(KEY)).toBe("true");
		expect(collapsed()).toBe("true");
	});

	it("ignores storage entirely in controlled mode", async () => {
		// Arrange
		localStorage.setItem(KEY, "true");

		// Act
		renderShell({ desktopCollapsed: false });

		// Assert
		expect(collapsed()).toBe("false");
		expect(localStorage.getItem(KEY)).toBe("true");
	});

	it("collapses when another tab stores true", () => {
		// Arrange
		renderShell();

		// Act
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: KEY, newValue: "true" }),
			);
		});

		// Assert
		expect(collapsed()).toBe("true");
	});

	it("expands when another tab stores false", () => {
		// Arrange
		localStorage.setItem(KEY, "true");
		renderShell();
		expect(collapsed()).toBe("true");

		// Act
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: KEY, newValue: "false" }),
			);
		});

		// Assert
		expect(collapsed()).toBe("false");
	});

	it("ignores a storage event for a different key", () => {
		// Arrange
		renderShell();

		// Act
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: "other", newValue: "true" }),
			);
		});

		// Assert
		expect(collapsed()).toBe("false");
	});

	it("ignores a storage event with an unrecognized value", () => {
		// Arrange
		localStorage.setItem(KEY, "true");
		renderShell();
		expect(collapsed()).toBe("true");

		// Act
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: KEY, newValue: "maybe" }),
			);
		});

		// Assert
		expect(collapsed()).toBe("true");
	});

	it("does not echo a cross-tab change back into storage", () => {
		// Arrange
		renderShell();

		// Act
		act(() => {
			window.dispatchEvent(
				new StorageEvent("storage", { key: KEY, newValue: "true" }),
			);
		});

		// Assert
		expect(collapsed()).toBe("true");
		expect(localStorage.getItem(KEY)).toBeNull();
	});

	it("stops listening for storage events after unmount", () => {
		// Arrange
		const remove = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderShell();

		// Act
		unmount();

		// Assert
		expect(remove).toHaveBeenCalledWith("storage", expect.any(Function));
		remove.mockRestore();
	});

	it("never collapses when the sidebar is not collapsible", async () => {
		// Arrange
		renderShell({ sidebarCollapsible: false, defaultDesktopCollapsed: true });

		// Assert
		expect(collapsed()).toBe("false");
	});
});
