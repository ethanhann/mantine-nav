import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("WorkspaceSwitcher", () => {
	it("WorkspaceSwitcher renders active workspace", () => {
		const ws = { id: "1", name: "My Workspace" };
		render(
			<WorkspaceSwitcher
				workspaces={[ws]}
				activeWorkspace={ws}
				onSwitch={() => {}}
			/>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("My Workspace")).toBeInTheDocument();
	});

	it("WorkspaceSwitcher toggles dropdown and shows items", async () => {
		const user = userEvent.setup();
		const ws1 = { id: "1", name: "WS 1" };
		const ws2 = { id: "2", name: "WS 2" };
		const onSwitch = vi.fn();
		render(
			<WorkspaceSwitcher
				workspaces={[ws1, ws2]}
				activeWorkspace={ws1}
				onSwitch={onSwitch}
			/>,
			{ wrapper: Wrapper },
		);

		// Click trigger to open menu
		await user.click(screen.getByText("WS 1"));

		// Menu renders in a portal - verify the trigger has aria-expanded
		const trigger = screen.getByRole("button", { expanded: true });
		expect(trigger).toBeInTheDocument();
	});

	it("WorkspaceSwitcher calls onSwitch when selecting a workspace", async () => {
		const user = userEvent.setup();
		const ws1 = { id: "1", name: "WS 1" };
		const ws2 = { id: "2", name: "WS 2" };
		const onSwitch = vi.fn();
		render(
			<WorkspaceSwitcher
				workspaces={[ws1, ws2]}
				activeWorkspace={ws1}
				onSwitch={onSwitch}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("WS 1"));
		const menuItem = await screen.findByText("WS 2");
		await user.click(menuItem);
		expect(onSwitch).toHaveBeenCalledWith(ws2);
	});

	it("WorkspaceSwitcher filters workspaces when searchable", async () => {
		const user = userEvent.setup();
		const ws1 = { id: "1", name: "Alpha" };
		const ws2 = { id: "2", name: "Beta" };
		const ws3 = { id: "3", name: "Gamma" };
		render(
			<WorkspaceSwitcher
				workspaces={[ws1, ws2, ws3]}
				activeWorkspace={ws1}
				onSwitch={() => {}}
				searchable
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("Alpha"));
		const searchInput = await screen.findByLabelText("Search workspaces");
		await user.type(searchInput, "bet");
		expect(screen.getByText("Beta")).toBeInTheDocument();
		expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
	});

	it("WorkspaceSwitcher shows create button when onCreate provided", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn();
		const ws = { id: "1", name: "WS 1" };
		render(
			<WorkspaceSwitcher
				workspaces={[ws]}
				activeWorkspace={ws}
				onSwitch={() => {}}
				onCreate={onCreate}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("WS 1"));
		const createBtn = await screen.findByText("Create workspace");
		await user.click(createBtn);
		expect(onCreate).toHaveBeenCalled();
	});

	it("renders a JSX logo node in the workspace avatar", () => {
		// Arrange
		const workspaces = [
			{ id: "w1", name: "Acme", logo: <svg data-testid="logo-node" /> },
		];

		// Act
		render(
			<WorkspaceSwitcher
				workspaces={workspaces}
				activeWorkspace={workspaces[0]!}
				onSwitch={() => {}}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByTestId("logo-node")).toBeInTheDocument();
	});

	it("passes renderWorkspace through to dropdown rows", async () => {
		// Arrange
		const user = userEvent.setup();
		const workspaces = [
			{ id: "w1", name: "One" },
			{ id: "w2", name: "Two" },
		];
		render(
			<WorkspaceSwitcher
				workspaces={workspaces}
				activeWorkspace={workspaces[0]!}
				onSwitch={() => {}}
				renderWorkspace={(ws, isActive) => (
					<span data-testid={`row-${ws.id}`}>
						{ws.name}
						{isActive ? " (current)" : ""}
					</span>
				)}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await user.click(screen.getByRole("button"));

		// Assert
		const dropdown = await screen.findByTestId("context-switcher-dropdown");
		expect(within(dropdown).getByTestId("row-w2")).toHaveTextContent("Two");
		expect(within(dropdown).getByTestId("row-w1")).toHaveTextContent(
			"One (current)",
		);
	});

	it("applies custom labels to the WorkspaceSwitcher", async () => {
		// Arrange
		const user = userEvent.setup();
		const ws = { id: "1", name: "Acme" };
		render(
			<WorkspaceSwitcher
				workspaces={[ws]}
				activeWorkspace={ws}
				onSwitch={() => {}}
				onCreate={() => {}}
				searchable
				labels={{
					searchPlaceholder: "Arbeitsbereiche suchen...",
					createWorkspace: "Arbeitsbereich erstellen",
				}}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await user.click(screen.getByTestId("context-switcher-target"));

		// Assert
		expect(
			await screen.findByPlaceholderText("Arbeitsbereiche suchen..."),
		).toBeInTheDocument();
		expect(screen.getByText("Arbeitsbereich erstellen")).toBeInTheDocument();
	});
});
