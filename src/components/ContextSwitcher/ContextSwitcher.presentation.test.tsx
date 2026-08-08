import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

function labels() {
	return document.querySelectorAll(".mantine-Menu-label");
}

function dividers() {
	return document.querySelectorAll(".mantine-Menu-divider");
}

describe("ContextSwitcher defaults", () => {
	it("shows the default placeholder with no active item", async () => {
		// Arrange, Act
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("Choose context")).toBeInTheDocument();
	});

	it("prefers a labels placeholder over the prop", async () => {
		// Arrange, Act
		render(
			<ContextSwitcher
				items={items}
				onSelect={() => {}}
				placeholder="Prop"
				labels={{ placeholder: "Labels" }}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("Labels")).toBeInTheDocument();
	});

	it("names the target with the active item", async () => {
		// Arrange, Act
		render(<ContextSwitcher items={items} active="a" onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByTestId("context-switcher-target")).toHaveAttribute(
			"aria-label",
			"Switch context, current: Acme",
		);
	});

	it("names the target with the placeholder when nothing is active", async () => {
		// Arrange, Act
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByTestId("context-switcher-target")).toHaveAttribute(
			"aria-label",
			"Choose context",
		);
	});

	it("rounds the target corners", async () => {
		// Arrange, Act
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByTestId("context-switcher-target")).toHaveStyle({
			borderRadius: "var(--mantine-radius-sm)",
		});
	});

	it("starts closed", async () => {
		// Arrange, Act
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(
			screen.queryByTestId("context-switcher-dropdown"),
		).not.toBeInTheDocument();
	});

	it("uses the default search labels", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} searchable />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		const input = screen.getByTestId("context-switcher-search");
		expect(input).toHaveAttribute("placeholder", "Search...");
		expect(input).toHaveAttribute("aria-label", "Search");
	});
});

describe("ContextSwitcher structure", () => {
	it("renders no divider without actions or a footer", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(dividers()).toHaveLength(0);
	});

	it("renders a divider once actions exist", async () => {
		// Arrange
		render(
			<ContextSwitcher
				items={items}
				onSelect={() => {}}
				actions={[{ id: "new", label: "New", onClick: () => {} }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await open();

		// Assert
		expect(dividers()).toHaveLength(1);
	});

	it("renders a divider for a footer alone", async () => {
		// Arrange
		render(
			<ContextSwitcher
				items={items}
				onSelect={() => {}}
				footer={<span>Foot</span>}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await open();

		// Assert
		expect(dividers()).toHaveLength(1);
	});

	it("labels sections but not unsectioned groups", async () => {
		// Arrange
		render(
			<ContextSwitcher
				items={[
					{ id: "a", label: "Acme" },
					{ id: "b", label: "Globex", section: "Partners" },
				]}
				onSelect={() => {}}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await open();

		// Assert
		expect(labels()).toHaveLength(1);
		expect(labels()[0]).toHaveTextContent("Partners");
	});

	it("renders only the label for an item with no description", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(screen.getByTestId("context-switcher-item-a")).toHaveTextContent(
			/^Acme$/,
		);
	});

	it("sizes the scroll area from maxVisible", async () => {
		// Arrange
		render(
			<ContextSwitcher items={items} onSelect={() => {}} maxVisible={10} />,
			{ wrapper: Wrapper },
		);

		// Act
		await open();

		// Assert
		const sized = Array.from(dropdown().querySelectorAll("div")).find(
			(d) => d.style.maxHeight,
		);
		expect(sized?.style.maxHeight).toBe("calc(27.5rem * var(--mantine-scale))");
	});
});

describe("ContextSwitcher loading", () => {
	it("renders three skeleton rows", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} loading />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(document.querySelectorAll(".mantine-Skeleton-root")).toHaveLength(3);
	});

	it("spaces all but the last skeleton row", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} loading />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		const spacing = Array.from(
			document.querySelectorAll(".mantine-Skeleton-root"),
		).map((s) => getComputedStyle(s).marginBottom);
		expect(spacing[0]).not.toBe("0rem");
		expect(spacing[1]).toBe(spacing[0]);
		expect(spacing[2]).toBe("0rem");
	});

	it("hides the item list while loading", async () => {
		// Arrange
		render(<ContextSwitcher items={items} onSelect={() => {}} loading />, {
			wrapper: Wrapper,
		});

		// Act
		await open();

		// Assert
		expect(
			screen.queryByTestId("context-switcher-item-a"),
		).not.toBeInTheDocument();
	});

	it("hides the empty message while loading", async () => {
		// Arrange
		render(
			<ContextSwitcher items={[]} onSelect={() => {}} loading searchable />,
			{ wrapper: Wrapper },
		);
		await open();

		// Act
		fireEvent.change(screen.getByTestId("context-switcher-search"), {
			target: { value: "zzz" },
		});

		// Assert
		expect(
			screen.queryByTestId("context-switcher-empty"),
		).not.toBeInTheDocument();
	});
});
