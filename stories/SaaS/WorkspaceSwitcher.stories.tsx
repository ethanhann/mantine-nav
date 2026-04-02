import type { Meta, StoryObj } from "@storybook/react";

import { WorkspaceSwitcher } from "../../src";
import { sampleWorkspaces } from "../_data";

const meta: Meta<typeof WorkspaceSwitcher> = {
	title: "SaaS/WorkspaceSwitcher",
	component: WorkspaceSwitcher,
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
type Story = StoryObj<typeof WorkspaceSwitcher>;

export const Default: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
	},
};

export const WithSearch: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
		searchable: true,
	},
};

export const WithCreate: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
		onCreate: () => console.log("Create workspace"),
		searchable: true,
	},
};
