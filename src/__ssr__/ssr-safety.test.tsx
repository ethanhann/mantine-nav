// @vitest-environment node

import { MantineProvider } from "@mantine/core";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { NavShell } from "../components/NavShell/NavShell";
import { useNavVars } from "../hooks/useNavVars";
import { usePersistedList } from "../hooks/usePersistedList";
import { useResponsiveNav } from "../hooks/useResponsiveNav";
import { useSidebarResize } from "../hooks/useSidebarResize";

function Probe({ render }: { render: () => string }): ReactElement {
	return <span>{render()}</span>;
}

beforeEach(() => {
	localStorage.clear();
});

describe("server rendering without a DOM", () => {
	it("has no window or document", () => {
		// Arrange, Act, Assert
		expect(typeof window).toBe("undefined");
		expect(typeof document).toBe("undefined");
	});

	it("useResponsiveNav falls back to a 1024 pixel viewport", () => {
		// Arrange
		function Widget() {
			const { viewportWidth } = useResponsiveNav();
			return <span>{String(viewportWidth)}</span>;
		}

		// Act
		const html = renderToString(<Widget />);

		// Assert
		expect(html).toContain("1024");
	});

	it("useResponsiveNav reports desktop defaults on the server", () => {
		// Arrange
		function Widget() {
			const { isDesktop, sidebarMode } = useResponsiveNav();
			return <span>{`${isDesktop}:${sidebarMode}`}</span>;
		}

		// Act
		const html = renderToString(<Widget />);

		// Assert
		expect(html).toContain("true:persistent");
	});

	it("usePersistedList ignores stored items on the server", () => {
		// Arrange
		localStorage.setItem("ssr-list", JSON.stringify(["alpha", "beta"]));
		function Widget() {
			const { items } = usePersistedList<string>({
				storageKey: "ssr-list",
				getId: (item) => item,
			});
			return <span>{`count=${items.length}`}</span>;
		}

		// Act
		const html = renderToString(<Widget />);

		// Assert
		expect(html).toContain("count=0");
	});

	it("useSidebarResize ignores a stored width on the server", () => {
		// Arrange
		localStorage.setItem("ssr-width", "300");
		function Widget() {
			const { width } = useSidebarResize({
				persistKey: "ssr-width",
				defaultWidth: 250,
			});
			return <span>{String(width)}</span>;
		}

		// Act
		const html = renderToString(<Widget />);

		// Assert
		expect(html).toContain("250");
	});

	it("useNavVars getVar returns an empty string on the server", () => {
		// Arrange
		function Widget() {
			const { getVar } = useNavVars();
			return <Probe render={() => `[${getVar("--mantine-color-body")}]`} />;
		}

		// Act
		const html = renderToString(<Widget />);

		// Assert
		expect(html).toContain("[]");
	});

	it("NavShell ignores persisted collapse state on the server", () => {
		// Arrange
		localStorage.setItem("ssr-collapse", "true");

		// Act
		const html = renderToString(
			<MantineProvider>
				<NavShell
					collapsePersistKey="ssr-collapse"
					sidebar={<div>sidebar</div>}
				>
					<div>content</div>
				</NavShell>
			</MantineProvider>,
		);

		// Assert
		expect(html).toContain("--app-shell-navbar-width:calc(16.25rem");
		expect(html).not.toContain("--app-shell-navbar-width:calc(5rem");
	});

	it("useNavVars setVar and resetVars are inert on the server", () => {
		// Arrange
		function Widget() {
			const { setVar, resetVars } = useNavVars();
			setVar("--nav-width", "300px");
			resetVars();
			return <span>ok</span>;
		}

		// Act, Assert
		expect(() => renderToString(<Widget />)).not.toThrow();
	});
});
