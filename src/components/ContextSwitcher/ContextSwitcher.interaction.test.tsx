import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContextSwitcher } from "./ContextSwitcher";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const items = [
	{ id: "a", label: "Acme" },
	{ id: "b", label: "Globex", description: "Second workspace" },
];

async function open() {
	fireEvent.click(screen.getByTestId("context-switcher-target"));
	return screen.findByTestId("context-switcher-dropdown");
}

function dropdown() {
	return screen.getByTestId("context-switcher-dropdown");
}

function _labels() {
	return document.querySelectorAll(".mantine-Menu-label");
}

function _dividers() {
	return document.querySelectorAll(".mantine-Menu-divider");
}

describe("ContextSwitcher filtering", () => {
	it("shows the default empty message when nothing matches", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} searchable />, {
			wrapper: Wrapper,
		});
		await open();

		// Act
		fireEvent.change(screen.getByTestId("context-switcher-search"), {
			target: { value: "zzz" },
		});

		// Assert
		expect(screen.getByTestId("context-switcher-empty")).toHaveTextContent(
			"No matches found",
		);
	});

	it("matches against the description as well as the label", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} searchable />, {
			wrapper: Wrapper,
		});
		await open();

		// Act
		fireEvent.change(screen.getByTestId("context-switcher-search"), {
			target: { value: "second" },
		});

		// Assert
		expect(screen.getByTestId("context-switcher-item-b")).toBeInTheDocument();
		expect(
			screen.queryByTestId("context-switcher-item-a"),
		).not.toBeInTheDocument();
	});

	it("does not fold placeholder text into the searchable content", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} searchable />, {
			wrapper: Wrapper,
		});
		await open();

		// Act
		fireEvent.change(screen.getByTestId("context-switcher-search"), {
			target: { value: "stryker" },
		});

		// Assert
		expect(screen.getByTestId("context-switcher-empty")).toBeInTheDocument();
	});

	it("shows no empty message when the list is simply unsearchable", async () => {
		// Arrange
		render(<ContextSwitcher items={[]} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(
			screen.queryByTestId("context-switcher-empty"),
		).not.toBeInTheDocument();
	});

	it("clears the search when the menu closes", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} searchable />, {
			wrapper: Wrapper,
		});
		await open();
		fireEvent.change(screen.getByTestId("context-switcher-search"), {
			target: { value: "glo" },
		});

		// Act
		fireEvent.keyDown(document.body, { key: "Escape" });
		await open();

		// Assert
		expect(screen.getByTestId("context-switcher-search")).toHaveValue("");
	});
});

describe("ContextSwitcher selection", () => {
	it("ignores clicks on a disabled item", async () => {
		// Arrange
		const onSelect = vi.fn();
		render(
			<ContextSwitcher
				items={[{ id: "a", label: "Acme", disabled: true }]}
				onSelect={onSelect}
			/>,
			{ wrapper: Wrapper },
		);
		await open();

		// Act
		fireEvent.click(screen.getByTestId("context-switcher-item-a"));

		// Assert
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("closes immediately for a synchronous handler", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});
		await open();

		// Act
		fireEvent.click(screen.getByTestId("context-switcher-item-a"));

		// Assert
		await waitFor(() =>
			expect(
				screen.queryByTestId("context-switcher-dropdown"),
			).not.toBeInTheDocument(),
		);
	});

	it("marks the dropdown busy while an async selection is pending", async () => {
		// Arrange
		let settle: () => void = () => {};
		const onSelect = () =>
			new Promise<void>((resolve) => {
				settle = resolve;
			});
		render(<ContextSwitcher items={items} onSelect={onSelect} />, {
			wrapper: Wrapper,
		});
		await open();

		// Act
		fireEvent.click(screen.getByTestId("context-switcher-item-a"));

		// Assert
		expect(dropdown()).toHaveAttribute("aria-busy", "true");
		expect(dropdown()).toHaveAttribute("data-pending", "true");
		settle();
		await waitFor(() =>
			expect(
				screen.queryByTestId("context-switcher-dropdown"),
			).not.toBeInTheDocument(),
		);
	});

	it("leaves the dropdown unmarked when nothing is pending", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(dropdown()).not.toHaveAttribute("aria-busy");
		expect(dropdown()).not.toHaveAttribute("data-pending");
	});
});
