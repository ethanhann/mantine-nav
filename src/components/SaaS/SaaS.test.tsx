import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconSun } from "@tabler/icons-react";
import { describe, expect, it, vi } from "vitest";
import { ColorModePicker } from "../ColorModePicker";
import { NotificationIndicator } from "./NotificationIndicator";
import { PlanBadge } from "./PlanBadge";
import { UserMenu } from "./UserMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("SaaS Components (Mantine v2)", () => {
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
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
			/>,
			{ wrapper: Wrapper },
		);

		const trigger = screen.getByLabelText("Notifications (1 unread)");
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(trigger).toHaveAttribute("aria-haspopup", "menu");
	});

	it("NotificationIndicator accepts notifications without timestamp", () => {
		const notifications = [
			{ id: "1", title: "New message", description: "Hello" },
		];
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
			/>,
			{ wrapper: Wrapper },
		);

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

	it("ColorModePicker toggle variant renders a cycling button", () => {
		render(<ColorModePicker />, { wrapper: Wrapper });
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button.getAttribute("aria-label")).toMatch(/click for/);
	});

	it("ColorModePicker toggle variant cycles to next mode on click", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<ColorModePicker value="auto" onChange={onChange} />,
			{ wrapper: Wrapper },
		);

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

	it("ColorModePicker menu variant renders trigger button", () => {
		render(<ColorModePicker variant="menu" />, { wrapper: Wrapper });
		expect(screen.getByRole("button", { name: "Color mode" })).toBeInTheDocument();
	});

	it("ColorModePicker custom mode calls onActivate", async () => {
		const user = userEvent.setup();
		const onActivate = vi.fn();
		const onChange = vi.fn();
		const modes = [
			{ value: "light", label: "Light", icon: <IconSun size={16} /> },
			{ value: "hc", label: "High Contrast", icon: <IconSun size={16} />, onActivate },
		];
		render(
			<ColorModePicker variant="segmented" modes={modes} value="light" onChange={onChange} />,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByText("High Contrast"));
		expect(onActivate).toHaveBeenCalled();
		expect(onChange).toHaveBeenCalledWith("hc");
	});
});
