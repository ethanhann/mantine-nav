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

function _menuItems() {
	return Array.from(document.querySelectorAll(".mantine-Menu-item"));
}

function badge() {
	return document.querySelector(".mantine-Indicator-indicator");
}

describe("NotificationIndicator badge", () => {
	it("shows no badge when there is nothing unread", () => {
		// Arrange, Act
		render(<NotificationIndicator />, { wrapper: Wrapper });

		// Assert
		expect(badge()).toBeNull();
	});

	it("counts unread notifications when no count is given", () => {
		// Arrange, Act
		render(<NotificationIndicator notifications={[unread, read]} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(badge()).toHaveTextContent(/^1$/);
	});

	it("shows the raw count at the cap", () => {
		// Arrange, Act
		render(<NotificationIndicator count={99} />, { wrapper: Wrapper });

		// Assert
		expect(badge()).toHaveTextContent(/^99$/);
	});

	it("shows an overflow badge past the cap", () => {
		// Arrange, Act
		render(<NotificationIndicator count={100} />, { wrapper: Wrapper });

		// Assert
		expect(badge()).toHaveTextContent("99+");
	});

	it("honors a custom count formatter", () => {
		// Arrange, Act
		render(
			<NotificationIndicator count={5} formatCount={(n) => `${n} new`} />,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(badge()).toHaveTextContent("5 new");
	});

	it("names the bell with the unread count", () => {
		// Arrange, Act
		render(<NotificationIndicator count={3} />, { wrapper: Wrapper });

		// Assert
		expect(
			screen.getByLabelText("Notifications (3 unread)"),
		).toBeInTheDocument();
	});

	it("names the bell without a count when nothing is unread", () => {
		// Arrange, Act
		render(<NotificationIndicator count={0} />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
	});

	it("honors a custom bell label", () => {
		// Arrange, Act
		render(
			<NotificationIndicator
				count={2}
				labels={{ bell: (n) => `${n} alerts` }}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByLabelText("2 alerts")).toBeInTheDocument();
	});

	it("falls back to the default bell label when labels omit it", () => {
		// Arrange, Act
		render(<NotificationIndicator count={1} labels={{ title: "Alerts" }} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(
			screen.getByLabelText("Notifications (1 unread)"),
		).toBeInTheDocument();
	});

	it("calls onClick directly when the dropdown is disabled", () => {
		// Arrange
		const onClick = vi.fn();
		render(
			<NotificationIndicator
				showDropdown={false}
				onClick={onClick}
				count={1}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		fireEvent.click(screen.getByLabelText("Notifications (1 unread)"));

		// Assert
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe("NotificationIndicator badge from SaaS suite", () => {
	it("NotificationIndicator renders bell icon", () => {
		render(<NotificationIndicator count={5} />, { wrapper: Wrapper });
		expect(
			screen.getByLabelText("Notifications (5 unread)"),
		).toBeInTheDocument();
	});

	it("NotificationIndicator caps at maxCount", () => {
		render(<NotificationIndicator count={150} maxCount={99} />, {
			wrapper: Wrapper,
		});
		expect(screen.getByText("99+")).toBeInTheDocument();
	});

	it("NotificationIndicator uses formatCount for badge display", () => {
		// Arrange / Act
		render(
			<NotificationIndicator count={150} formatCount={(n) => `${n} new`} />,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("150 new")).toBeInTheDocument();
	});

	it("NotificationIndicator formatCount overrides maxCount", () => {
		// Arrange / Act
		render(
			<NotificationIndicator
				count={150}
				maxCount={99}
				formatCount={(n) => String(n)}
			/>,
			{ wrapper: Wrapper },
		);

		// Assert
		expect(screen.getByText("150")).toBeInTheDocument();
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
});
