import { Group, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconAccessible,
	IconDeviceDesktop,
	IconMoon,
	IconSun,
} from "@tabler/icons-react";
import { useState } from "react";
import type { ColorMode } from "../../src";
import { ColorModePicker } from "../../src";

/** Color mode picker with three variants: a cycling toggle button (default), a segmented control, or a dropdown menu. Supports system, light, and dark modes out of the box, and is extensible with custom modes. */
const meta: Meta<typeof ColorModePicker> = {
	title: "ColorModePicker",
	component: ColorModePicker,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ padding: 24 }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ColorModePicker>;

/** Default toggle button — click to cycle through System, Light, Dark. Tooltip shows the current mode. */
export const Default: Story = {};

/** Segmented control showing all modes at once. */
export const Segmented: Story = {
	args: {
		variant: "segmented",
	},
};

/** Segmented control with icons only, no text labels. */
export const SegmentedIconsOnly: Story = {
	args: {
		variant: "segmented",
		showLabels: false,
	},
};

/** Dropdown menu variant for space-constrained contexts like a header. */
export const MenuVariant: Story = {
	args: {
		variant: "menu",
	},
};

/** Controlled segmented picker with a custom "High Contrast" mode added via the modes prop. */
export const CustomModes: Story = {
	render: () => {
		const [value, setValue] = useState("auto");

		const modes: ColorMode[] = [
			{
				value: "auto",
				label: "System",
				icon: <IconDeviceDesktop size={16} stroke={1.5} />,
			},
			{
				value: "light",
				label: "Light",
				icon: <IconSun size={16} stroke={1.5} />,
			},
			{
				value: "dark",
				label: "Dark",
				icon: <IconMoon size={16} stroke={1.5} />,
			},
			{
				value: "high-contrast",
				label: "High Contrast",
				icon: <IconAccessible size={16} stroke={1.5} />,
				onActivate: () => console.log("High contrast mode activated"),
			},
		];

		return (
			<>
				<ColorModePicker
					variant="segmented"
					modes={modes}
					value={value}
					onChange={setValue}
				/>
				<Text size="sm" c="dimmed" mt="sm">
					Active: {value}
				</Text>
			</>
		);
	},
};

/** All available sizes for the toggle variant. */
export const Sizes: Story = {
	render: () => (
		<Group align="center" gap="xl">
			{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
				<div key={size}>
					<Text size="xs" c="dimmed" mb={4}>
						{size}
					</Text>
					<ColorModePicker size={size} />
				</div>
			))}
		</Group>
	),
};
