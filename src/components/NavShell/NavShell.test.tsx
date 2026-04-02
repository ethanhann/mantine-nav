import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
		const FakeLink = (props: any) => <a data-testid="fake-link" {...props} />;

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
});
