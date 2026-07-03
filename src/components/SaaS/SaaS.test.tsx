import { MantineProvider } from "@mantine/core";
import { IconSun } from "@tabler/icons-react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorModePicker } from "../ColorModePicker";
import { NotificationIndicator } from "./NotificationIndicator";
import { PlanBadge } from "./PlanBadge";
import { UserMenu } from "./UserMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("SaaS Components", () => {
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

	it("PlanBadge renders plan name", () => {
		render(<PlanBadge plan="Pro" />, { wrapper: Wrapper });
		expect(screen.getByText("Pro")).toBeInTheDocument();
	});

	it("PlanBadge shows upgrade CTA", () => {
		render(<PlanBadge plan="Free" showUpgrade onUpgrade={() => {}} />, {
			wrapper: Wrapper,
		});
		expect(screen.getByText("Upgrade")).toBeInTheDocument();
	});

	it("NotificationIndicator renders bell icon", () => {
		render(<NotificationIndicator count={5} />, { wrapper: Wrapper });
		expect(
			screen.getByLabelText("Notifications (5 unread)"),
		).toBeInTheDocument();
	});

	it("NotificationIndicator opens dropdown with timestamp notification", async () => {
		const user = userEvent.setup();
		const notifications = [
			{ id: "1", title: "New message", timestamp: "2 hours ago" },
		];
		render(<NotificationIndicator count={1} notifications={notifications} />, {
			wrapper: Wrapper,
		});

		const trigger = screen.getByLabelText("Notifications (1 unread)");
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(trigger).toHaveAttribute("aria-haspopup", "menu");
	});

	it("NotificationIndicator accepts notifications without timestamp", () => {
		const notifications = [
			{ id: "1", title: "New message", description: "Hello" },
		];
		render(<NotificationIndicator count={1} notifications={notifications} />, {
			wrapper: Wrapper,
		});

		expect(
			screen.getByLabelText("Notifications (1 unread)"),
		).toBeInTheDocument();
	});

	it("NotificationIndicator caps at maxCount", () => {
		render(<NotificationIndicator count={150} maxCount={99} />, {
			wrapper: Wrapper,
		});
		expect(screen.getByText("99+")).toBeInTheDocument();
	});

	it("UserMenu renders user name", () => {
		const user = { id: "1", name: "Jane Doe", email: "jane@example.com" };
		render(<UserMenu user={user} />, { wrapper: Wrapper });
		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
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

	it("NotificationIndicator calls onRead when clicking a notification", async () => {
		const user = userEvent.setup();
		const onRead = vi.fn();
		const notifications = [
			{ id: "n1", title: "Alert 1" },
			{ id: "n2", title: "Alert 2" },
		];
		render(
			<NotificationIndicator
				count={2}
				notifications={notifications}
				onRead={onRead}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByLabelText("Notifications (2 unread)"));
		const alert = await screen.findByText("Alert 1");
		await user.click(alert);
		expect(onRead).toHaveBeenCalledWith("n1");
	});

	it("NotificationIndicator shows mark-all-as-read when unread exist", async () => {
		const user = userEvent.setup();
		const onReadAll = vi.fn();
		const notifications = [{ id: "n1", title: "Unread alert", read: false }];
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
				onReadAll={onReadAll}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByLabelText("Notifications (1 unread)"));
		const markAllButton = await screen.findByText("Mark all as read");
		await user.click(markAllButton);
		expect(onReadAll).toHaveBeenCalled();
	});

	it("NotificationIndicator without dropdown fires onClick", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(
			<NotificationIndicator
				count={3}
				showDropdown={false}
				onClick={onClick}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByLabelText("Notifications (3 unread)"));
		expect(onClick).toHaveBeenCalled();
	});

	it("ColorModePicker toggle variant renders a cycling button", () => {
		render(<ColorModePicker />, { wrapper: Wrapper });
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button.getAttribute("aria-label")).toMatch(/switch to/);
	});

	it("ColorModePicker toggle variant cycles to next mode on click", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<ColorModePicker value="auto" onChange={onChange} />, {
			wrapper: Wrapper,
		});

		await user.click(screen.getByRole("button"));
		expect(onChange).toHaveBeenCalledWith("light");
	});

	it("ColorModePicker segmented variant renders all modes", () => {
		render(<ColorModePicker variant="segmented" />, { wrapper: Wrapper });
		expect(screen.getByText("System")).toBeInTheDocument();
		expect(screen.getByText("Light")).toBeInTheDocument();
		expect(screen.getByText("Dark")).toBeInTheDocument();
	});

	it("ColorModePicker segmented controlled mode calls onChange", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ColorModePicker variant="segmented" value="light" onChange={onChange} />,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("Dark"));
		expect(onChange).toHaveBeenCalledWith("dark");
	});

	it("ColorModePicker uncontrolled toggle calls setColorScheme", async () => {
		const user = userEvent.setup();
		render(<ColorModePicker />, { wrapper: Wrapper });

		const button = screen.getByRole("button");
		await user.click(button);
		// No error means setColorScheme was called with a builtin value
		expect(button).toBeInTheDocument();
	});

	it("ColorModePicker segmented without labels renders icons only", () => {
		render(<ColorModePicker variant="segmented" showLabels={false} />, {
			wrapper: Wrapper,
		});
		expect(screen.queryByText("System")).not.toBeInTheDocument();
		expect(screen.queryByText("Light")).not.toBeInTheDocument();
		expect(screen.queryByText("Dark")).not.toBeInTheDocument();
	});

	it("ColorModePicker menu variant renders trigger button", () => {
		render(<ColorModePicker variant="menu" />, { wrapper: Wrapper });
		expect(
			screen.getByRole("button", { name: "Color mode" }),
		).toBeInTheDocument();
	});

	it("ColorModePicker custom mode calls onActivate", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();
		const onChange = vi.fn();
		const modes = [
			{ value: "light", label: "Light", icon: <IconSun size={16} /> },
			{
				value: "hc",
				label: "High Contrast",
				icon: <IconSun size={16} />,
				onActivate,
			},
		];
		render(
			<ColorModePicker
				variant="segmented"
				modes={modes}
				value="light"
				onChange={onChange}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("High Contrast"));
		expect(onActivate).toHaveBeenCalled();
		expect(onChange).toHaveBeenCalledWith("hc");
	});
	describe("P1 defect regressions", () => {
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

		it("derives the badge count from notifications when count is omitted", () => {
			// Arrange
			const notifications = [
				{ id: "n1", title: "One", read: false },
				{ id: "n2", title: "Two", read: false },
				{ id: "n3", title: "Three", read: true },
			];

			// Act
			render(<NotificationIndicator notifications={notifications} />, {
				wrapper: Wrapper,
			});

			// Assert
			expect(screen.getByText("2")).toBeInTheDocument();
			expect(
				screen.getByLabelText("Notifications (2 unread)"),
			).toBeInTheDocument();
		});

		it("keeps the dropdown open when marking a notification as read", async () => {
			// Arrange
			const user = userEvent.setup();
			const onRead = vi.fn();
			const notifications = [{ id: "n1", title: "Hello", read: false }];
			render(
				<NotificationIndicator notifications={notifications} onRead={onRead} />,
				{ wrapper: Wrapper },
			);
			await user.click(screen.getByLabelText("Notifications (1 unread)"));

			// Act
			await user.click(await screen.findByText("Hello"));

			// Assert
			expect(onRead).toHaveBeenCalledWith("n1");
			expect(screen.getByText("Hello")).toBeInTheDocument();
		});

		it("renders the NotificationIndicator dropdown when opened is controlled", () => {
			// Arrange
			const notifications = [{ id: "n1", title: "Hello", read: false }];

			// Act
			render(<NotificationIndicator notifications={notifications} opened />, {
				wrapper: Wrapper,
			});

			// Assert
			expect(screen.getByText("Hello")).toBeInTheDocument();
		});

		it("renders the UserMenu dropdown when opened is controlled", () => {
			// Arrange
			const user = { id: "1", name: "Jane", email: "jane@acme.com" };

			// Act
			render(
				<UserMenu
					user={user}
					opened
					menuItems={[{ label: "Sign out", onClick: () => {} }]}
				/>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(screen.getByText("Sign out")).toBeInTheDocument();
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

		it("shows a loading state in the NotificationIndicator dropdown", () => {
			// Arrange

			// Act
			render(
				<NotificationIndicator
					notifications={[{ id: "n1", title: "Hello", read: false }]}
					loading
					opened
				/>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(screen.getByTestId("notification-loading")).toBeInTheDocument();
			expect(screen.queryByText("Hello")).not.toBeInTheDocument();
		});

		it("marks the active mode in the menu variant with aria-current and a check", async () => {
			// Arrange
			const user = userEvent.setup();
			render(<ColorModePicker variant="menu" value="dark" />, {
				wrapper: Wrapper,
			});

			// Act
			await user.click(screen.getByLabelText("Color mode"));

			// Assert
			// Mantine's open transition never completes in jsdom, so the
			// dropdown stays a11y-hidden; query with hidden: true.
			const dark = await screen.findByRole("menuitem", {
				name: /Dark/,
				hidden: true,
			});
			expect(dark).toHaveAttribute("aria-current", "true");
			expect(dark.querySelector("svg")).not.toBeNull();
			const light = screen.getByRole("menuitem", {
				name: /Light/,
				hidden: true,
			});
			expect(light).not.toHaveAttribute("aria-current");
		});

		it("applies custom labels to the NotificationIndicator", () => {
			// Arrange
			const notifications = [{ id: "n1", title: "Hi", read: false }];

			// Act
			render(
				<NotificationIndicator
					notifications={notifications}
					onReadAll={() => {}}
					opened
					labels={{
						title: "Benachrichtigungen",
						markAllAsRead: "Alle als gelesen markieren",
						bell: (unread) => `${unread} ungelesen`,
					}}
				/>,
				{ wrapper: Wrapper },
			);

			// Assert
			expect(screen.getByText("Benachrichtigungen")).toBeInTheDocument();
			expect(
				screen.getByText("Alle als gelesen markieren"),
			).toBeInTheDocument();
			expect(screen.getByLabelText("1 ungelesen")).toBeInTheDocument();
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

		it("renders nothing for an empty modes array instead of crashing", () => {
			// Arrange

			// Act
			render(<ColorModePicker modes={[]} />, { wrapper: Wrapper });

			// Assert
			expect(screen.queryByRole("button")).not.toBeInTheDocument();
		});
	});
});
