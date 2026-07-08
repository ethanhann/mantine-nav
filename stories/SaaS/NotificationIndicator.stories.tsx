import { Badge, Group, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NotificationIndicator } from "../../src";
import { sampleNotifications } from "../_data";

/** Bell icon with unread count badge and an optional dropdown listing recent notifications. */
const meta: Meta<typeof NotificationIndicator> = {
	title: "SaaS/NotificationIndicator",
	component: NotificationIndicator,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ display: "inline-block" }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof NotificationIndicator>;

/** Shows 3 unread notifications with a dropdown. */
export const Default: Story = {
	args: {
		count: 3,
		notifications: sampleNotifications,
		onRead: (id) => console.log("Read:", id),
		onReadAll: () => console.log("Read all"),
	},
};

/** Badge hidden when count is zero. */
export const NoNotifications: Story = {
	args: {
		count: 0,
		notifications: [],
	},
};

/** Count exceeds maxCount and displays as "99+". */
export const HighCount: Story = {
	args: {
		count: 150,
		maxCount: 99,
		notifications: sampleNotifications,
	},
};

/** Dropdown disabled; clicking the bell fires onClick instead. */
export const WithoutDropdown: Story = {
	args: {
		count: 5,
		showDropdown: false,
		onClick: () => console.log("Bell clicked"),
	},
};

/** Custom badge formatter that shows the raw count. */
export const CustomFormatCount: Story = {
	args: {
		count: 1234,
		notifications: sampleNotifications,
		formatCount: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n),
	},
};

/** Custom timestamp formatter showing relative time. */
export const CustomTimestamps: Story = {
	args: {
		count: 2,
		notifications: [
			{
				id: "1",
				title: "Deployment succeeded",
				description: "Production deploy completed",
				read: false,
				timestamp: new Date(Date.now() - 3600 * 1000),
			},
			{
				id: "2",
				title: "New team member",
				description: "Alice joined the project",
				read: true,
				timestamp: new Date(Date.now() - 86400 * 1000),
			},
		],
		formatTimestamp: (d: Date) => {
			const mins = Math.round((Date.now() - d.getTime()) / 60000);
			if (mins < 60) return `${mins}m ago`;
			const hrs = Math.round(mins / 60);
			if (hrs < 24) return `${hrs}h ago`;
			return `${Math.round(hrs / 24)}d ago`;
		},
	},
};

/** Fully custom notification renderer with badges and layout. */
export const CustomRenderNotification: Story = {
	args: {
		count: 2,
		notifications: [
			{ id: "1", title: "Build failed", description: "CI pipeline #4821", read: false },
			{ id: "2", title: "PR approved", description: "feat: add breadcrumbs", read: true },
		],
		renderNotification: (n) => (
			<Group gap="xs" wrap="nowrap">
				<Badge size="xs" color={n.read ? "gray" : "red"} variant="dot" />
				<div>
					<Text size="sm" fw={n.read ? 400 : 600}>{n.title}</Text>
					{n.description && <Text size="xs" c="dimmed">{n.description}</Text>}
				</div>
			</Group>
		),
	},
};
