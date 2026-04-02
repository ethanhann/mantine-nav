import type { Meta, StoryObj } from "@storybook/react";

import { UserMenu } from "../../src";
import { sampleUser, sampleUserMenuItems } from "../_data";

const meta: Meta<typeof UserMenu> = {
	title: "SaaS/UserMenu",
	component: UserMenu,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ width: 260, padding: 8 }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
	},
};

export const WithEmail: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
		showEmail: true,
	},
};

export const WithRole: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
		showRole: true,
		showEmail: true,
	},
};
