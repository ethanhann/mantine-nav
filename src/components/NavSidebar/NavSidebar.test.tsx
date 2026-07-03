import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NavShell } from "../NavShell";
import { NavSidebar } from "./NavSidebar";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("NavSidebar", () => {
	it("renders header, body, and footer sections", () => {
		// Arrange

		// Act
		render(
			<NavSidebar header={<span>Header</span>} footer={<span>Footer</span>}>
				<span>Body</span>
			</NavSidebar>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("Header")).toBeInTheDocument();
		expect(screen.getByText("Body")).toBeInTheDocument();
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("does not clamp expanded sections to a fixed max height", () => {
		// Arrange

		// Act
		const { container } = render(
			<NavSidebar header={<span>Header</span>} footer={<span>Footer</span>}>
				<span>Body</span>
			</NavSidebar>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(container.innerHTML).not.toContain("max-height: 500px");
	});

	it("toggles the shell collapse state via the collapse toggle", async () => {
		// Arrange
		const user = userEvent.setup();
		render(
			<NavShell
				sidebar={
					<NavSidebar footer={<span>Footer</span>}>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Act
		await user.click(screen.getByLabelText("Collapse sidebar"));

		// Assert
		expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
	});

	it("hides the collapse toggle when showCollapseToggle is false", () => {
		// Arrange

		// Act
		render(
			<NavShell
				sidebar={
					<NavSidebar showCollapseToggle={false}>
						<span>Body</span>
					</NavSidebar>
				}
			>
				<div>Main</div>
			</NavShell>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.queryByLabelText("Collapse sidebar")).not.toBeInTheDocument();
	});

	it("renders standalone without a NavShell", () => {
		// Arrange

		// Act
		render(<NavSidebar>Body</NavSidebar>, { wrapper: Wrapper });

		// Assert
		expect(screen.getByText("Body")).toBeInTheDocument();
		expect(screen.queryByLabelText("Collapse sidebar")).not.toBeInTheDocument();
	});
});
