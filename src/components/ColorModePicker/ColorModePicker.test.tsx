import { MantineProvider } from "@mantine/core";
import { IconSun } from "@tabler/icons-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorModePicker } from "./index";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("ColorModePicker", () => {
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

	it("ColorModePicker uncontrolled toggle cycles mode on click", async () => {
		// Arrange
		const user = userEvent.setup();
		render(<ColorModePicker />, { wrapper: Wrapper });
		const button = screen.getByRole("button");
		const labelBefore = button.getAttribute("aria-label");

		// Act
		await user.click(button);

		// Assert
		const labelAfter = button.getAttribute("aria-label");
		expect(labelAfter).not.toBe(labelBefore);
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

	it("renders nothing for an empty modes array instead of crashing", () => {
		// Arrange

		// Act
		render(<ColorModePicker modes={[]} />, { wrapper: Wrapper });

		// Assert
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
