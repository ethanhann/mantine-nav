import type { Meta, StoryObj } from "@storybook/react-vite";

import { NotificationIndicator } from "../../src";
import { sampleNotifications } from "../_data";

/** Bell icon with unread count badge and an optional dropdown listing recent notifications. */
const meta: Meta<typeof NotificationIndicator> = {
	title: "SaaS/NotificationIndicator",
	component: NotificationIndicator,
	tags: ["autodocs"],
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
