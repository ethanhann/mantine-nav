import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotificationIndicator } from "./NotificationIndicator";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const unread = { id: "1", title: "Deploy failed", read: false };
const read = { id: "2", title: "Deploy passed", read: true };

function menuItems() {
	return Array.from(document.querySelectorAll(".mantine-Menu-item"));
}

function _badge() {
	return document.querySelector(".mantine-Indicator-indicator");
}

describe("NotificationIndicator entries", () => {
	it("names an unread entry as unread", () => {
		// Arrange, Act
		render(<NotificationIndicator opened notifications={[unread]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(menuItems()[0]).toHaveAttribute(
			"aria-label",
			"Deploy failed (unread)",
		);
	});

	it("names a read entry without the unread suffix", () => {
		// Arrange, Act
		render(<NotificationIndicator opened notifications={[read]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(menuItems()[0]).toHaveAttribute("aria-label", "Deploy passed");
	});

	it("renders an entry with an href as a link", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[{ ...unread, href: "/deploys" }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(menuItems()[0]).toHaveAttribute("href", "/deploys");
	});

	it("reports a read action for the clicked entry", () => {
		// Arrange
		const onRead = vi.fn();
		render(
			<NotificationIndicator opened notifications={[unread]} onRead={onRead} />,
			{ wrapper: Wrapper },
		);

		// Act
		fireEvent.click(menuItems()[0]!);

		// Assert
		expect(onRead).toHaveBeenCalledWith("1");
	});

	it("tolerates a click with no read handler", () => {
		// Arrange
		render(<NotificationIndicator opened notifications={[unread]} />, {
			wrapper: Wrapper,
		});

		// Act, Assert
		expect(() => fireEvent.click(menuItems()[0]!)).not.toThrow();
	});

	it("shows a description when present", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[{ ...unread, description: "Build 42" }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("Build 42")).toBeInTheDocument();
	});

	it("renders nothing beyond the title when there is no description", () => {
		// Arrange, Act
		render(<NotificationIndicator opened notifications={[unread]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(menuItems()[0]).toHaveTextContent(/^Deploy failed$/);
	});

	it("renders a string timestamp verbatim", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[{ ...unread, timestamp: "2 hours ago" }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("2 hours ago")).toBeInTheDocument();
	});

	it("formats a Date timestamp with the supplied formatter", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[{ ...unread, timestamp: new Date(0) }]}
				formatTimestamp={() => "just now"}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("just now")).toBeInTheDocument();
	});

	it("falls back to locale formatting for a Date timestamp", () => {
		// Arrange
		const stamp = new Date(0);

		// Act
		render(
			<NotificationIndicator
				opened
				notifications={[{ ...unread, timestamp: stamp }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText(stamp.toLocaleString())).toBeInTheDocument();
	});

	it("uses a custom renderer when provided", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				opened
				notifications={[unread]}
				renderNotification={(n) => <span>custom {n.title}</span>}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("custom Deploy failed")).toBeInTheDocument();
	});
});

describe("NotificationIndicator entries from SaaS suite", () => {
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

	it("NotificationIndicator uses formatTimestamp for Date timestamps", async () => {
		// Arrange
		const user = userEvent.setup();
		const date = new Date("2026-07-01T12:00:00Z");
		const notifications = [
			{ id: "1", title: "Test", timestamp: date, read: false },
		];

		// Act
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
				formatTimestamp={(d) => `${d.getFullYear()} custom`}
			/>,
			{ wrapper: Wrapper },
		);
		await user.click(screen.getByLabelText("Notifications (1 unread)"));

		// Assert
		expect(await screen.findByText("2026 custom")).toBeInTheDocument();
	});

	it("NotificationIndicator formatTimestamp does not affect string timestamps", async () => {
		// Arrange
		const user = userEvent.setup();
		const notifications = [
			{ id: "1", title: "Test", timestamp: "5 min ago", read: false },
		];

		// Act
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
				formatTimestamp={() => "should not appear"}
			/>,
			{ wrapper: Wrapper },
		);
		await user.click(screen.getByLabelText("Notifications (1 unread)"));

		// Assert
		expect(await screen.findByText("5 min ago")).toBeInTheDocument();
	});

	it("NotificationIndicator uses renderNotification for custom item rendering", async () => {
		// Arrange
		const user = userEvent.setup();
		const notifications = [
			{ id: "1", title: "Custom", description: "desc", read: false },
		];

		// Act
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
				renderNotification={(n) => (
					<span data-testid={`custom-${n.id}`}>{n.title} (custom)</span>
				)}
			/>,
			{ wrapper: Wrapper },
		);
		await user.click(screen.getByLabelText("Notifications (1 unread)"));

		// Assert
		expect(await screen.findByTestId("custom-1")).toBeInTheDocument();
		expect(screen.getByText("Custom (custom)")).toBeInTheDocument();
	});

	it("NotificationIndicator renderNotification preserves onRead and menu behavior", async () => {
		// Arrange
		const user = userEvent.setup();
		const onRead = vi.fn();
		const notifications = [{ id: "1", title: "Test", read: false }];

		// Act
		render(
			<NotificationIndicator
				count={1}
				notifications={notifications}
				onRead={onRead}
				renderNotification={(n) => <span>{n.title}</span>}
			/>,
			{ wrapper: Wrapper },
		);
		await user.click(screen.getByLabelText("Notifications (1 unread)"));
		await user.click(await screen.findByText("Test"));

		// Assert
		expect(onRead).toHaveBeenCalledWith("1");
	});
});
