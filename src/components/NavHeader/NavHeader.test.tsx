import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavHeader } from "./NavHeader";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("NavHeader", () => {
	it("renders logo", () => {
		render(<NavHeader logo={<span>MyLogo</span>} />, { wrapper: Wrapper });
		expect(screen.getByText("MyLogo")).toBeInTheDocument();
	});

	it("renders environment badge when provided", () => {
		render(
			<NavHeader
				logo={<span>Logo</span>}
				environment={{ label: "Staging", color: "orange" }}
			/>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Staging")).toBeInTheDocument();
	});

	it("does not render environment badge when not provided", () => {
		render(<NavHeader logo={<span>Logo</span>} />, { wrapper: Wrapper });
		expect(screen.queryByText("Staging")).not.toBeInTheDocument();
	});

	it("renders center children", () => {
		render(
			<NavHeader logo={<span>Logo</span>}>
				<span>Center Content</span>
			</NavHeader>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Center Content")).toBeInTheDocument();
	});

	it("renders right section", () => {
		render(
			<NavHeader
				logo={<span>Logo</span>}
				rightSection={<button type="button">Action</button>}
			/>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Action")).toBeInTheDocument();
	});
});
