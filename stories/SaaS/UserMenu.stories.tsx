import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserMenu } from "../../src";
import { sampleUser, sampleUserMenuItems } from "../_data";

/** Avatar button that opens a dropdown with user info and action items. */
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

/** Avatar and name only. */
export const Default: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
	},
};

/** Displays the user's email below their name. */
export const WithEmail: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
		showEmail: true,
	},
};

/** Shows both email and role badge. */
export const WithRole: Story = {
	args: {
		user: sampleUser,
		menuItems: sampleUserMenuItems,
		showRole: true,
		showEmail: true,
	},
};
