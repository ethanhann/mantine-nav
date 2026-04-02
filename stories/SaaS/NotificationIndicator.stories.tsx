import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { NotificationIndicator } from "../../src";
import { sampleNotifications } from "../_data";

const meta: Meta<typeof NotificationIndicator> = {
	title: "SaaS/NotificationIndicator",
	component: NotificationIndicator,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NotificationIndicator>;

export const Default: Story = {
	args: {
		count: 3,
		notifications: sampleNotifications,
		onRead: (id) => console.log("Read:", id),
		onReadAll: () => console.log("Read all"),
	},
};

export const NoNotifications: Story = {
	args: {
		count: 0,
		notifications: [],
	},
};

export const HighCount: Story = {
	args: {
		count: 150,
		maxCount: 99,
		notifications: sampleNotifications,
	},
};

export const WithoutDropdown: Story = {
	args: {
		count: 5,
		showDropdown: false,
		onClick: () => console.log("Bell clicked"),
	},
};
