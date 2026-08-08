import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotificationIndicator } from "./NotificationIndicator";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const unread = { id: "1", title: "Deploy failed", read: false };
const read = { id: "2", title: "Deploy passed", read: true };

function _menuItems() {
	return Array.from(document.querySelectorAll(".mantine-Menu-item"));
}

function badge() {
	return document.querySelector(".mantine-Indicator-indicator");
}

describe("NotificationIndicator dropdown", () => {
	it("anchors the dropdown below and to the end by default", () => {
		// Arrange, Act
		render(<NotificationIndicator opened />, { wrapper: Wrapper });

		// Assert
		expect(document.querySelector(".mantine-Menu-dropdown")).toHaveAttribute(
			"data-position",
			"bottom-end",
		);
	});

	it("titles the dropdown", () => {
		// Arrange, Act
		render(<NotificationIndicator opened />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByText("Notifications")).toBeInTheDocument();
	});

	it("honors a custom title", () => {
		// Arrange, Act
		render(<NotificationIndicator opened labels={{ title: "Alerts" }} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("Alerts")).toBeInTheDocument();
	});

	it("shows the empty state with no notifications", () => {
		// Arrange, Act
		render(<NotificationIndicator opened />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByText("No notifications")).toBeInTheDocument();
	});

	it("honors a custom empty message", () => {
		// Arrange, Act
		render(<NotificationIndicator opened labels={{ empty: "All clear" }} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("All clear")).toBeInTheDocument();
	});

	it("offers mark-all-as-read when something is unread", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[unread, read]}
				onReadAll={() => {}}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("Mark all as read")).toBeInTheDocument();
	});

	it("hides mark-all-as-read when everything is read", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[read]}
				onReadAll={() => {}}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.queryByText("Mark all as read")).not.toBeInTheDocument();
	});

	it("hides mark-all-as-read without a handler", () => {
		// Arrange, Act
		render(<NotificationIndicator opened notifications={[unread]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.queryByText("Mark all as read")).not.toBeInTheDocument();
	});

	it("renders three skeleton rows while loading", () => {
		// Arrange, Act
		render(<NotificationIndicator opened loading />, { wrapper: Wrapper });

		// Assert
		const skeletons = document.querySelectorAll(".mantine-Skeleton-root");
		expect(skeletons).toHaveLength(3);
	});

	it("spaces every skeleton row except the last", () => {
		// Arrange, Act
		render(<NotificationIndicator opened loading />, { wrapper: Wrapper });

		// Assert
		const spacing = Array.from(
			document.querySelectorAll(".mantine-Skeleton-root"),
		).map((s) => getComputedStyle(s).marginBottom);
		expect(spacing[0]).not.toBe("0rem");
		expect(spacing[1]).toBe(spacing[0]);
		expect(spacing[2]).toBe("0rem");
	});

	it("does not animate the badge", () => {
		// Arrange, Act
		render(<NotificationIndicator count={1} />, { wrapper: Wrapper });

		// Assert
		expect(badge()).not.toHaveAttribute("data-processing");
	});
});

describe("NotificationIndicator dropdown from SaaS suite", () => {
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
		expect(screen.getByText("Alle als gelesen markieren")).toBeInTheDocument();
		expect(screen.getByLabelText("1 ungelesen")).toBeInTheDocument();
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
});
