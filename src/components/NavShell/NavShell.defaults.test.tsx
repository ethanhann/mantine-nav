import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavShell } from "./NavShell";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("NavShell layout defaults", () => {
	function html() {
		return document.documentElement.innerHTML;
	}

	it("draws section borders by default", () => {
		// Arrange, Act
		render(
			<NavShell header={<span>H</span>} sidebar={<span>Nav</span>}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(document.querySelector(".mantine-AppShell-navbar")).toHaveAttribute(
			"data-with-border",
			"true",
		);
	});

	it("omits section borders when asked", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<span>Nav</span>} withBorder={false}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(
			document.querySelector(".mantine-AppShell-navbar"),
		).not.toHaveAttribute("data-with-border");
	});

	it("uses the default layout mode", () => {
		// Arrange, Act
		render(
			<NavShell header={<span>H</span>} sidebar={<span>Nav</span>}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(document.querySelector(".mantine-AppShell-root")).toHaveAttribute(
			"data-layout",
			"default",
		);
	});

	it("applies the default padding", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<span>Nav</span>}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(html()).toContain("--app-shell-padding:var(--mantine-spacing-md)");
	});

	it("collapses the navbar at the small breakpoint by default", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<span>Nav</span>}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(html()).toContain("@media(max-width: 47.99375em)");
	});

	it("hides the aside at the medium breakpoint by default", () => {
		// Arrange, Act
		render(
			<NavShell sidebar={<span>Nav</span>} aside={<span>A</span>}>
				<span>C</span>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(html()).toContain("--app-shell-aside-width");
		expect(html()).toContain("@media(max-width: 61.99375em)");
	});
});
