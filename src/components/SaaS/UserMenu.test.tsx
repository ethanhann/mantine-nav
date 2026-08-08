import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UserMenu } from "./UserMenu";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

const user = {
	id: "1",
	name: "Jane Doe",
	email: "jane@example.com",
	role: "Admin",
};

function dropdown() {
	return document.querySelector(".mantine-Menu-dropdown") as HTMLElement;
}

async function openMenu() {
	await userEvent
		.setup()
		.click(screen.getByLabelText("User menu for Jane Doe"));
	return screen.findByRole("menu");
}

describe("UserMenu trigger content", () => {
	it("hides the role when showRole is false", () => {
		// Arrange, Act
		render(<UserMenu user={user} showRole={false} />, { wrapper: Wrapper });

		// Assert
		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
	});

	it("hides the role when the user has none", () => {
		// Arrange, Act
		render(<UserMenu user={{ id: "1", name: "Jane Doe" }} />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
		expect(screen.queryByText("Admin")).not.toBeInTheDocument();
	});

	it("hides the email by default", () => {
		// Arrange, Act
		render(<UserMenu user={user} />, { wrapper: Wrapper });

		// Assert
		expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
	});

	it("hides the email when the user has none and showEmail is set", () => {
		// Arrange, Act
		render(<UserMenu user={{ id: "1", name: "Jane Doe" }} showEmail />, {
			wrapper: Wrapper,
		});

		// Assert
		expect(screen.queryByText("jane@example.com")).not.toBeInTheDocument();
	});
});

describe("UserMenu dropdown position", () => {
	it("defaults to top-start for the full variant", async () => {
		// Arrange
		render(<UserMenu user={user} menuItems={[{ label: "A" }]} />, {
			wrapper: Wrapper,
		});

		// Act
		await openMenu();

		// Assert
		expect(dropdown()).toHaveAttribute("data-position", "top-start");
	});

	it("defaults to bottom-end for the compact variant", async () => {
		// Arrange
		render(
			<UserMenu user={user} variant="compact" menuItems={[{ label: "A" }]} />,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(dropdown()).toHaveAttribute("data-position", "bottom-end");
	});

	it("honors an explicit position over the variant default", async () => {
		// Arrange
		render(
			<UserMenu
				user={user}
				variant="compact"
				position="left-start"
				menuItems={[{ label: "A" }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(dropdown()).toHaveAttribute("data-position", "left-start");
	});
});

describe("UserMenu dropdown contents", () => {
	it("renders no menu items when none are provided", async () => {
		// Arrange
		render(<UserMenu user={user} />, { wrapper: Wrapper });

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-item")).toHaveLength(0);
	});

	it("renders one menu item per entry", async () => {
		// Arrange
		render(
			<UserMenu user={user} menuItems={[{ label: "A" }, { label: "B" }]} />,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-item")).toHaveLength(2);
	});

	it("renders a single divider when no item requests one", async () => {
		// Arrange
		render(
			<UserMenu user={user} menuItems={[{ label: "A" }, { label: "B" }]} />,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-divider")).toHaveLength(1);
	});

	it("renders one extra divider per item that requests one", async () => {
		// Arrange
		render(
			<UserMenu
				user={user}
				menuItems={[{ label: "A" }, { label: "B", dividerBefore: true }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-divider")).toHaveLength(2);
	});

	it("renders name and email labels for a user with an email", async () => {
		// Arrange
		render(<UserMenu user={user} menuItems={[{ label: "A" }]} />, {
			wrapper: Wrapper,
		});

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-label")).toHaveLength(2);
	});

	it("renders only the name label for a user without an email", async () => {
		// Arrange
		render(
			<UserMenu
				user={{ id: "1", name: "Jane Doe" }}
				menuItems={[{ label: "A" }]}
			/>,
			{ wrapper: Wrapper },
		);

		// Act
		await openMenu();

		// Assert
		expect(document.querySelectorAll(".mantine-Menu-label")).toHaveLength(1);
	});

	it("truncates long label text rather than wrapping it", async () => {
		// Arrange
		render(<UserMenu user={user} menuItems={[{ label: "A" }]} />, {
			wrapper: Wrapper,
		});

		// Act
		await openMenu();

		// Assert
		expect(document.querySelector(".mantine-Menu-label")).toHaveStyle({
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
		});
	});
});

describe("UserMenu trigger shape", () => {
	it("gives the compact trigger a pill radius", () => {
		// Arrange, Act
		render(<UserMenu user={user} variant="compact" />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByLabelText("User menu for Jane Doe")).toHaveStyle({
			borderRadius: "var(--mantine-radius-xl)",
		});
	});

	it("sizes the avatar small by default", () => {
		// Arrange, Act
		render(<UserMenu user={user} />, { wrapper: Wrapper });

		// Assert
		expect(document.querySelector(".mantine-Avatar-root")).toHaveStyle({
			"--avatar-size": "var(--avatar-size-sm)",
		});
	});

	it("honors an explicit avatar size", () => {
		// Arrange, Act
		render(<UserMenu user={user} avatarSize="lg" />, { wrapper: Wrapper });

		// Assert
		expect(document.querySelector(".mantine-Avatar-root")).toHaveStyle({
			"--avatar-size": "var(--avatar-size-lg)",
		});
	});

	it("gives the full trigger a small radius", () => {
		// Arrange, Act
		render(<UserMenu user={user} />, { wrapper: Wrapper });

		// Assert
		expect(screen.getByLabelText("User menu for Jane Doe")).toHaveStyle({
			borderRadius: "var(--mantine-radius-sm)",
		});
	});
});
